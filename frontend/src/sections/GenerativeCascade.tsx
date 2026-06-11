import { useEffect, useRef } from 'react'
import { Link } from 'react-router'
import * as THREE from 'three'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { galleryConfig, type WorkItem } from '../config'

gsap.registerPlugin(ScrollTrigger)

function distributeCards(works: WorkItem[]) {
  const cols: WorkItem[][] = [[], [], [], []]
  works.forEach((card, i) => {
    cols[i % 4].push(card)
  })
  return cols
}

export default function GenerativeCascade() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const sectionRef = useRef<HTMLDivElement>(null)
  const cleanupRef = useRef<(() => void) | null>(null)
  const tweensRef = useRef<gsap.core.Tween[]>([])

  const works = galleryConfig.works
  const hasWorks = works.length > 0

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas || !hasWorks) return
    let disposed = false
    let animFrameId = 0

    const scene = new THREE.Scene()
    scene.background = new THREE.Color(0xffffff)

    const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000)
    camera.position.z = 5

    const renderer = new THREE.WebGLRenderer({ canvas, antialias: true })
    renderer.setSize(window.innerWidth, window.innerHeight)
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))

    const geometry = new THREE.PlaneGeometry(0.6, 0.8)
    const material = new THREE.MeshBasicMaterial({ color: 0x1c4a96, side: THREE.DoubleSide, wireframe: true })
    const count = 400
    const mesh = new THREE.InstancedMesh(geometry, material, count)

    const dummy = new THREE.Object3D()
    const speeds = new Float32Array(count)

    for (let i = 0; i < count; i++) {
      dummy.position.x = (Math.random() - 0.5) * 18
      dummy.position.y = (Math.random() - 0.5) * 18
      dummy.position.z = (Math.random() - 0.5) * 12
      dummy.rotation.set(0, 0, Math.random() * Math.PI)
      dummy.updateMatrix()
      mesh.setMatrixAt(i, dummy.matrix)
      speeds[i] = (Math.random() * 0.015) + 0.005
    }
    scene.add(mesh)

    const onResize = () => {
      camera.aspect = window.innerWidth / window.innerHeight
      camera.updateProjectionMatrix()
      renderer.setSize(window.innerWidth, window.innerHeight)
    }
    window.addEventListener('resize', onResize)

    const dummyPos = new THREE.Vector3()
    const dummyQuat = new THREE.Quaternion()
    const dummyScale = new THREE.Vector3()

    const animate = () => {
      if (disposed) return
      animFrameId = requestAnimationFrame(animate)

      for (let i = 0; i < count; i++) {
        mesh.getMatrixAt(i, dummy.matrix)
        dummy.matrix.decompose(dummyPos, dummyQuat, dummyScale)
        dummy.position.copy(dummyPos)
        dummy.quaternion.copy(dummyQuat)
        dummy.scale.copy(dummyScale)
        dummy.position.y += speeds[i]
        dummy.rotation.y += 0.008
        if (dummy.position.y > 9) {
          dummy.position.y = -9
        }
        dummy.updateMatrix()
        mesh.setMatrixAt(i, dummy.matrix)
      }
      mesh.instanceMatrix.needsUpdate = true
      renderer.render(scene, camera)
    }
    animate()

    cleanupRef.current = () => {
      disposed = true
      cancelAnimationFrame(animFrameId)
      window.removeEventListener('resize', onResize)
      geometry.dispose()
      material.dispose()
      renderer.dispose()
    }

    return () => {
      disposed = true
      cancelAnimationFrame(animFrameId)
      if (cleanupRef.current) cleanupRef.current()
    }
  }, [hasWorks])

  useEffect(() => {
    const section = sectionRef.current
    if (!section || !hasWorks) return

    const trackConfigs = [
      { selector: '#track-1', yPercent: -4, scrub: 1 },
      { selector: '#track-2', yPercent: -10, scrub: 1.1 },
      { selector: '#track-3', yPercent: -6, scrub: 0.9 },
      { selector: '#track-4', yPercent: -12, scrub: 1.2 },
    ]

    const tweens: gsap.core.Tween[] = []
    trackConfigs.forEach((cfg) => {
      const el = section.querySelector(cfg.selector)
      if (!el) return
      const tw = gsap.to(el, {
        yPercent: cfg.yPercent,
        ease: 'none',
        scrollTrigger: {
          trigger: '#engine-showcase',
          start: 'top top',
          end: 'bottom bottom',
          scrub: cfg.scrub,
        },
      })
      tweens.push(tw)
    })
    tweensRef.current = tweens

    return () => {
      tweens.forEach((tw) => tw.kill())
      ScrollTrigger.getAll().forEach((st) => {
        if (st.vars.trigger === '#engine-showcase') st.kill()
      })
    }
  }, [hasWorks])

  if (!hasWorks) return null

  const columns = distributeCards(works)

  return (
    <section
      id="engine-showcase"
      ref={sectionRef}
      style={{
        position: 'relative',
        width: '100%',
        background: '#ffffff',
        zIndex: 2,
        overflow: 'hidden',
      }}
    >
      <canvas
        ref={canvasRef}
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          zIndex: 0,
          opacity: 0.12,
        }}
      />

      <div
        style={{
          position: 'relative',
          zIndex: 1,
          display: 'flex',
          width: '100%',
          borderLeft: '1px solid var(--border-color)',
        }}
      >
        <div
          style={{
            width: 'clamp(160px, 18vw, 260px)',
            flexShrink: 0,
            borderRight: '1px solid var(--border-color)',
            position: 'sticky',
            top: 0,
            height: '100vh',
            padding: '32px 20px',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            background: 'rgba(255,255,255,0.92)',
          }}
        >
          <div>
            {galleryConfig.eyebrowLabel && (
              <div
                className="font-mono-data"
                style={{
                  fontSize: '0.65rem',
                  color: '#000',
                  letterSpacing: '0.15em',
                  marginBottom: '24px',
                  opacity: 0.5,
                }}
              >
                {galleryConfig.eyebrowLabel}
              </div>
            )}
            {galleryConfig.titleLines.length > 0 && (
              <div
                className="font-geist-mono"
                style={{
                  fontSize: '1.8rem',
                  fontWeight: 500,
                  color: '#000',
                  lineHeight: 1.15,
                  letterSpacing: '-0.02em',
                  marginBottom: '20px',
                }}
              >
                {galleryConfig.titleLines.map((line, i) => (
                  <span key={i}>
                    {line}
                    {i < galleryConfig.titleLines.length - 1 && <br />}
                  </span>
                ))}
              </div>
            )}
            {galleryConfig.stats.length > 0 && (
              <div
                className="font-mono-data"
                style={{
                  fontSize: '0.65rem',
                  color: 'rgba(0,0,0,0.4)',
                  lineHeight: 1.8,
                  letterSpacing: '0.05em',
                }}
              >
                {galleryConfig.stats.map((stat, i) => (
                  <div key={i}>
                    {stat.label}: {stat.value}
                  </div>
                ))}
              </div>
            )}
          </div>
          {galleryConfig.sideLabel && (
            <div
              className="font-mono-data"
              style={{
                fontSize: '0.6rem',
                color: 'rgba(0,0,0,0.25)',
                letterSpacing: '0.1em',
              }}
            >
              {galleryConfig.sideLabel}
            </div>
          )}
        </div>

        <div
          style={{
            flex: 1,
            display: 'grid',
            gridTemplateColumns: 'repeat(4, 1fr)',
            gap: 0,
            padding: '80px 0',
          }}
          className="cascade-grid"
        >
          {columns.map((col, colIdx) => (
            <div
              key={colIdx}
              style={{
                borderRight: colIdx < 3 ? '1px solid var(--border-color)' : 'none',
              }}
            >
              <div id={`track-${colIdx + 1}`}>
                {col.map((card) => (
                  <CascadeCard key={card.id} card={card} />
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      <style>{`
        @media (max-width: 768px) {
          .cascade-grid {
            grid-template-columns: repeat(2, 1fr) !important;
          }
          #track-3, #track-4 {
            display: none;
          }
        }
      `}</style>
    </section>
  )
}

function CascadeCard({ card }: { card: WorkItem }) {
  return (
    <Link
      to={`/work/${card.id.toLowerCase()}`}
      style={{
        display: 'block',
        border: '1px solid #000',
        margin: '-1px 0 0 0',
        padding: '20px 16px',
        background: '#ffffff',
        color: '#000000',
        textDecoration: 'none',
        transition: 'background 0.15s ease, color 0.15s ease',
        cursor: 'none',
      }}
      onMouseEnter={(e) => {
        const el = e.currentTarget
        el.style.background = '#000000'
        el.style.color = '#ffffff'
      }}
      onMouseLeave={(e) => {
        const el = e.currentTarget
        el.style.background = '#ffffff'
        el.style.color = '#000000'
      }}
    >
      <div
        className="font-mono-data"
        style={{
          fontSize: '0.6rem',
          opacity: 0.4,
          marginBottom: '10px',
          letterSpacing: '0.1em',
        }}
      >
        {card.id} // {card.type}
      </div>
      <div
        style={{
          fontSize: '1rem',
          fontWeight: 900,
          letterSpacing: '0.03em',
          marginBottom: '12px',
          lineHeight: 1.2,
        }}
      >
        {card.title}
      </div>
      <div
        style={{
          width: '100%',
          height: '160px',
          border: '1px solid currentColor',
          marginBottom: '12px',
          overflow: 'hidden',
          position: 'relative',
          contentVisibility: 'auto',
          containIntrinsicSize: '100% 160px',
          background: 'rgba(0,0,0,0.04)',
        }}
      >
        {card.image && (
          <img
            src={card.image}
            alt={card.title}
            loading="lazy"
            decoding="async"
            width={480}
            height={320}
            style={{
              width: '100%',
              height: '100%',
              objectFit: 'cover',
              display: 'block',
              filter: 'contrast(0.95) saturate(0.9)',
            }}
          />
        )}
      </div>
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}
      >
        <span
          className="font-mono-data"
          style={{
            fontSize: '0.6rem',
            letterSpacing: '0.08em',
            opacity: 0.6,
          }}
        >
          {card.status}
        </span>
        <span
          className="font-mono-data"
          style={{
            fontSize: '0.75rem',
            fontWeight: 700,
          }}
        >
          {card.metrics}
        </span>
      </div>
    </Link>
  )
}
