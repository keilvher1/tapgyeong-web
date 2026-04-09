import { useEffect, useRef } from 'react'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'

const SPOTS = {
  gyeongju: [
    { name: '불국사', lat: 35.7901, lng: 129.3319, cat: '문화유산' },
    { name: '석굴암', lat: 35.7957, lng: 129.3492, cat: '문화유산' },
    { name: '첨성대', lat: 35.8346, lng: 129.2189, cat: '문화유산' },
    { name: '동궁과 월지', lat: 35.8312, lng: 129.2262, cat: '문화유산' },
    { name: '대릉원', lat: 35.8368, lng: 129.2131, cat: '문화유산' },
    { name: '황리단길', lat: 35.8378, lng: 129.2115, cat: '체험' },
  ],
  andong: [
    { name: '하회마을', lat: 36.5393, lng: 128.5188, cat: '문화유산' },
    { name: '도산서원', lat: 36.7277, lng: 128.8398, cat: '문화유산' },
    { name: '봉정사', lat: 36.6494, lng: 128.6892, cat: '문화유산' },
    { name: '안동찜닭골목', lat: 36.5688, lng: 128.7264, cat: '맛집' },
  ],
  pohang: [
    { name: '호미곶', lat: 36.0761, lng: 129.5676, cat: '자연경관' },
    { name: '영일대해수욕장', lat: 36.0566, lng: 129.3762, cat: '자연경관' },
    { name: '죽도시장', lat: 36.0211, lng: 129.3666, cat: '체험' },
  ],
}

const ALL_SPOTS = [...SPOTS.gyeongju, ...SPOTS.andong, ...SPOTS.pohang]

const CITY_COLORS = {
  gyeongju: '#D97706',
  andong: '#059669',
  pohang: '#DB2777',
}

function createIcon(color) {
  return L.divIcon({
    className: '',
    html: `<div style="
      width:12px;height:12px;border-radius:50%;
      background:${color};border:2.5px solid #fff;
      box-shadow:0 2px 6px rgba(0,0,0,0.35);
    "></div>`,
    iconSize: [12, 12],
    iconAnchor: [6, 6],
  })
}

export default function KakaoMap({ height = 300, center, zoom = 10, markers = 'all', style: containerStyle = {} }) {
  const mapRef = useRef(null)
  const mapInstanceRef = useRef(null)

  useEffect(() => {
    if (mapInstanceRef.current) {
      mapInstanceRef.current.remove()
      mapInstanceRef.current = null
    }

    const defaultCenter = center || { lat: 36.1, lng: 129.0 }
    const map = L.map(mapRef.current, {
      center: [defaultCenter.lat, defaultCenter.lng],
      zoom,
      zoomControl: true,
      attributionControl: false,
    })

    mapInstanceRef.current = map

    // Tile layer
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 18,
    }).addTo(map)

    // Attribution (small)
    L.control.attribution({ prefix: false, position: 'bottomright' })
      .addAttribution('<a href="https://osm.org" style="font-size:9px">OSM</a>')
      .addTo(map)

    // Determine which spots to show
    let spotsToShow = ALL_SPOTS
    if (markers === 'gyeongju') { spotsToShow = SPOTS.gyeongju }
    else if (markers === 'andong') { spotsToShow = SPOTS.andong }
    else if (markers === 'pohang') { spotsToShow = SPOTS.pohang }

    // Add markers
    spotsToShow.forEach(spot => {
      let color = '#4A6CF7'
      if (SPOTS.gyeongju.includes(spot)) color = CITY_COLORS.gyeongju
      else if (SPOTS.andong.includes(spot)) color = CITY_COLORS.andong
      else if (SPOTS.pohang.includes(spot)) color = CITY_COLORS.pohang

      const marker = L.marker([spot.lat, spot.lng], { icon: createIcon(color) }).addTo(map)
      marker.bindPopup(
        `<div style="font-family:'Noto Sans KR',sans-serif;text-align:center;padding:2px 0;">
          <b style="font-size:13px;color:#1A1A2E;">${spot.name}</b><br/>
          <span style="font-size:11px;color:#8888A8;">${spot.cat}</span>
        </div>`,
        { className: 'custom-popup', closeButton: false, offset: [0, -4] }
      )
    })

    // Add city area circles
    const cityAreas = [
      { key: 'gyeongju', lat: 35.83, lng: 129.22, label: '경주' },
      { key: 'andong', lat: 36.57, lng: 128.73, label: '안동' },
      { key: 'pohang', lat: 36.04, lng: 129.37, label: '포항' },
    ]

    cityAreas.forEach(city => {
      if (markers === 'all' || markers === city.key) {
        L.circle([city.lat, city.lng], {
          radius: 12000,
          color: CITY_COLORS[city.key],
          weight: 1.5,
          fillColor: CITY_COLORS[city.key],
          fillOpacity: 0.08,
          dashArray: markers === 'all' ? '6,4' : null,
        }).addTo(map)

        // City label
        L.marker([city.lat, city.lng], {
          icon: L.divIcon({
            className: '',
            html: `<div style="
              background:${CITY_COLORS[city.key]};color:#fff;
              padding:3px 10px;border-radius:12px;
              font-size:11px;font-weight:700;
              font-family:'Noto Sans KR',sans-serif;
              box-shadow:0 2px 8px rgba(0,0,0,0.2);
              white-space:nowrap;text-align:center;
            "><i class="fa-solid fa-location-dot" style="margin-right:3px;font-size:9px"></i>${city.label}</div>`,
            iconSize: [60, 24],
            iconAnchor: [30, 12],
          }),
        }).addTo(map)
      }
    })

    // Invalidate size after render
    setTimeout(() => map.invalidateSize(), 100)

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove()
        mapInstanceRef.current = null
      }
    }
  }, [center, zoom, markers])

  return (
    <div
      ref={mapRef}
      style={{
        width: '100%',
        height,
        borderRadius: 16,
        overflow: 'hidden',
        boxShadow: '0 2px 12px rgba(0,0,0,0.08)',
        ...containerStyle,
      }}
    />
  )
}
