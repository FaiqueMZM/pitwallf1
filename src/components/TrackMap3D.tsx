import { useEffect, useRef, useState } from 'react'
import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
import type { TrackData } from '@/data/tracks'
import { getGeoJsonUrl } from '@/data/tracks'
import type { CarPosition } from './TrackMap2D'

export type { CarPosition }

interface TrackMap3DProps {
  track: TrackData
  carPositions?: CarPosition[]
  height?: number
  className?: string
}

async function fetchTrackPoints(track: TrackData): Promise<THREE.Vector3[]> {
  const res = await fetch(getGeoJsonUrl(track.geojsonId))
  if (!res.ok) throw new Error(`HTTP ${res.status}`)
  const geojson = await res.json()

  // Use D3 to get all coordinates from the GeoJSON
  const allCoords: [number, number][] = []
  for (const feature of geojson.features) {
    const geom = feature.geometry
    if (geom.type === 'LineString') {
      allCoords.push(...(geom.coordinates as [number, number][]))
    } else if (geom.type === 'MultiLineString') {
      for (const line of geom.coordinates as [number, number][][]) {
        allCoords.push(...line)
      }
    }
  }

  if (allCoords.length === 0) throw new Error('No coordinates found')

  // Project lat/lng to a flat 2D plane, then normalize to [-1.8, 1.8]
  const lons = allCoords.map(c => c[0])
  const lats = allCoords.map(c => c[1])
  const minLon = Math.min(...lons), maxLon = Math.max(...lons)
  const minLat = Math.min(...lats), maxLat = Math.max(...lats)
  const rangeX = maxLon - minLon, rangeY = maxLat - minLat
  const scale = Math.max(rangeX, rangeY)
  const cx = (minLon + maxLon) / 2, cy = (minLat + maxLat) / 2

  return allCoords.map(([lon, lat]) => new THREE.Vector3(
    ((lon - cx) / scale) * 3.6,
    0,
    -((lat - cy) / scale) * 3.6  // flip Y for 3D
  ))
}

export default function TrackMap3D({ track, carPositions = [], height = 350, className = '' }: TrackMap3DProps) {
  const mountRef = useRef<HTMLDivElement>(null)
  const animIdRef = useRef<number>(0)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)

  useEffect(() => {
    if (!mountRef.current) return
    const el = mountRef.current
    const W = el.clientWidth || 800
    const H = height

    setLoading(true)
    setError(false)

    const renderer = new THREE.WebGLRenderer({ antialias: true })
    renderer.setSize(W, H)
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
    renderer.setClearColor(0x0a0a0a)
    el.appendChild(renderer.domElement)

    const scene = new THREE.Scene()
    scene.background = new THREE.Color(0x0a0a0a)

    const camera = new THREE.PerspectiveCamera(45, W / H, 0.01, 50)
    camera.position.set(0, 5, 3)
    camera.lookAt(0, 0, 0)

    const controls = new OrbitControls(camera, renderer.domElement)
    controls.enableDamping = true
    controls.dampingFactor = 0.07
    controls.minDistance = 2
    controls.maxDistance = 12
    controls.maxPolarAngle = Math.PI / 2.1
    controls.autoRotate = true
    controls.autoRotateSpeed = 0.5

    scene.add(new THREE.AmbientLight(0xffffff, 0.6))
    const dir = new THREE.DirectionalLight(0xffffff, 1.4)
    dir.position.set(5, 10, 5)
    scene.add(dir)
    const rim = new THREE.PointLight(0xe8002d, 2, 8)
    rim.position.set(0, -0.5, 0)
    scene.add(rim)

    const ground = new THREE.Mesh(
      new THREE.PlaneGeometry(25, 25),
      new THREE.MeshStandardMaterial({ color: 0x0d0d0d, roughness: 1 })
    )
    ground.rotation.x = -Math.PI / 2
    ground.position.y = -0.05
    scene.add(ground)
    const grid = new THREE.GridHelper(20, 40, 0x1a1a1a, 0x161616)
    grid.position.y = -0.04
    scene.add(grid)

    let animId = 0
    function animate() {
      animId = requestAnimationFrame(animate)
      animIdRef.current = animId
      controls.update()
      rim.intensity = 1.5 + Math.sin(Date.now() * 0.001) * 0.5
      renderer.render(scene, camera)
    }
    animate()

    // Fetch GeoJSON and build track
    fetchTrackPoints(track)
      .then(points => {
        const curve = new THREE.CatmullRomCurve3(points, true, 'catmullrom', 0.4)

        // Track surface
        scene.add(new THREE.Mesh(
          new THREE.TubeGeometry(curve, 500, 0.06, 8, true),
          new THREE.MeshStandardMaterial({ color: 0x2a2a2a, roughness: 0.9 })
        ))

        // Red racing line
        const lineMesh = new THREE.Mesh(
          new THREE.TubeGeometry(curve, 500, 0.014, 6, true),
          new THREE.MeshStandardMaterial({ color: 0xe8002d, emissive: 0xe8002d, emissiveIntensity: 0.5, roughness: 0.3, metalness: 0.7 })
        )
        lineMesh.position.y = 0.014
        scene.add(lineMesh)

        // Start/finish marker
        const sfPt = curve.getPoint(0)
        const sfTan = curve.getTangent(0)
        const sfMesh = new THREE.Mesh(
          new THREE.BoxGeometry(0.14, 0.005, 0.003),
          new THREE.MeshBasicMaterial({ color: 0xffffff })
        )
        sfMesh.position.copy(sfPt)
        sfMesh.position.y = 0.02
        sfMesh.rotation.y = Math.atan2(sfTan.x, sfTan.z) + Math.PI / 2
        scene.add(sfMesh)

        // Car markers
        carPositions.forEach(car => {
          const progress = car.trackProgress ?? ((car.position - 1) / 20)
          const pt = curve.getPoint(progress % 1)
          const tan = curve.getTangent(progress % 1)
          const color = new THREE.Color(car.teamColour ? `#${car.teamColour.replace('#', '')}` : '#888888')

          const carMesh = new THREE.Mesh(
            new THREE.BoxGeometry(0.06, 0.022, 0.03),
            new THREE.MeshStandardMaterial({ color, emissive: color, emissiveIntensity: 0.7, roughness: 0.2, metalness: 0.8 })
          )
          carMesh.position.copy(pt)
          carMesh.position.y = 0.07
          carMesh.rotation.y = Math.atan2(tan.x, tan.z)
          scene.add(carMesh)

          const canvas = document.createElement('canvas')
          canvas.width = 80; canvas.height = 36
          const ctx = canvas.getContext('2d')!
          ctx.fillStyle = car.teamColour ? `#${car.teamColour.replace('#', '')}` : '#888888'
          ctx.beginPath(); ctx.roundRect(0, 0, 80, 36, 6); ctx.fill()
          ctx.fillStyle = '#ffffff'
          ctx.font = 'bold 13px monospace'
          ctx.textAlign = 'center'; ctx.textBaseline = 'middle'
          ctx.fillText(`P${car.position} ${car.nameAcronym}`, 40, 18)
          const sprite = new THREE.Sprite(new THREE.SpriteMaterial({ map: new THREE.CanvasTexture(canvas), depthTest: false }))
          sprite.position.copy(pt); sprite.position.y = 0.22
          sprite.scale.set(0.3, 0.14, 1)
          scene.add(sprite)
        })

        setLoading(false)
      })
      .catch(() => {
        setError(true)
        setLoading(false)
      })

    function onResize() {
      if (!mountRef.current) return
      const W2 = mountRef.current.clientWidth
      camera.aspect = W2 / H
      camera.updateProjectionMatrix()
      renderer.setSize(W2, H)
    }
    window.addEventListener('resize', onResize)

    return () => {
      cancelAnimationFrame(animIdRef.current)
      window.removeEventListener('resize', onResize)
      controls.dispose()
      scene.traverse(obj => {
        if (obj instanceof THREE.Mesh) {
          obj.geometry.dispose()
          Array.isArray(obj.material) ? obj.material.forEach(m => m.dispose()) : obj.material.dispose()
        }
      })
      renderer.dispose()
      if (el.contains(renderer.domElement)) el.removeChild(renderer.domElement)
    }
  }, [track.id])

  return (
    <div className={`relative rounded-lg overflow-hidden bg-[#0a0a0a] ${className}`} style={{ height }}>
      <div ref={mountRef} style={{ width: '100%', height: '100%' }} />
      {loading && (
        <div className="absolute inset-0 flex items-center justify-center bg-[#0a0a0a]">
          <div className="text-center">
            <div className="w-6 h-6 border-2 border-f1-red border-t-transparent rounded-full animate-spin mx-auto mb-2" />
            <p className="text-f1-gray-3 text-xs">Loading {track.circuit}...</p>
          </div>
        </div>
      )}
      {error && (
        <div className="absolute inset-0 flex items-center justify-center bg-[#0a0a0a]">
          <p className="text-f1-gray-3 text-xs text-center">Couldn't load 3D track map.<br /><span className="text-f1-gray-2">Check your connection.</span></p>
        </div>
      )}
      {!loading && !error && (
        <div className="absolute top-3 left-3 right-3 flex items-start justify-between pointer-events-none">
          <div className="bg-black/70 backdrop-blur-sm rounded-lg px-3 py-2 border border-white/10">
            <p className="font-display font-bold text-white text-sm uppercase tracking-widest leading-tight">{track.circuit}</p>
            <p className="text-white/40 text-xs mt-0.5">{track.lapLength} km · {track.turns} turns</p>
          </div>
          <div className="bg-black/70 backdrop-blur-sm rounded-lg px-3 py-2 border border-white/10 text-right">
            <p className="text-white/40 text-xs">Drag to rotate · Scroll to zoom</p>
            {carPositions.length > 0 && <p className="text-[#e8002d] text-xs font-semibold mt-0.5">{carPositions.length} cars live</p>}
          </div>
        </div>
      )}
    </div>
  )
}
