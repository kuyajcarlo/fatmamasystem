import { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { MapPin, Search, LocateFixed, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

// Free map + geocoding: OpenStreetMap tiles and Nominatim (no API key).
// Nominatim asks for light use: we search only on Enter / button (no search-as-you-type)
// and reverse-geocode once after the pin stops moving.
const NOMINATIM = 'https://nominatim.openstreetmap.org';
const DEFAULT_CENTER = [14.5995, 120.9842]; // Manila

const pinIcon = L.divIcon({
    className: '',
    html: '<div style="width:32px;height:32px;margin:-32px 0 0 -16px;position:relative"><div style="position:absolute;inset:0;background:#D4A843;border:3px solid #fff;border-radius:50% 50% 50% 0;transform:rotate(-45deg);box-shadow:0 2px 6px rgba(0,0,0,.4)"></div><div style="position:absolute;left:11px;top:9px;width:10px;height:10px;background:#fff;border-radius:50%"></div></div>',
    iconSize: [0, 0],
});

function toFields(result) {
    const a = result.address || {};
    const street = [a.house_number, a.road].filter(Boolean).join(' ');
    const area = a.suburb || a.neighbourhood || a.quarter || a.village || a.city_district || '';
    const address = [street, area].filter(Boolean).join(', ') || (result.display_name || '').split(',').slice(0, 2).join(',').trim();
    return {
        address,
        city: a.city || a.town || a.municipality || a.county || '',
        province: a.state || a.region || a.province || '',
        zipCode: a.postcode || '',
        lat: Number(result.lat),
        lng: Number(result.lon),
    };
}

/**
 * Grab / foodpanda style address picker.
 * onPick({ address, city, province, zipCode, lat, lng }) fires whenever the pin settles.
 */
export default function AddressPicker({ lat, lng, onPick }) {
    const mapEl = useRef(null);
    const map = useRef(null);
    const marker = useRef(null);
    const timer = useRef(null);
    const onPickRef = useRef(onPick);
    onPickRef.current = onPick;
    const [query, setQuery] = useState('');
    const [busy, setBusy] = useState(false);
    const [results, setResults] = useState([]);
    const [label, setLabel] = useState('');

    const reverse = async (la, ln) => {
        setBusy(true);
        try {
            const r = await fetch(`${NOMINATIM}/reverse?format=jsonv2&addressdetails=1&zoom=18&lat=${la}&lon=${ln}`, { headers: { 'Accept-Language': 'en' } });
            const data = await r.json();
            if (data && !data.error) {
                const fields = { ...toFields(data), lat: la, lng: ln };
                setLabel(data.display_name || '');
                onPickRef.current(fields);
            } else {
                onPickRef.current({ lat: la, lng: ln });
                toast.info('Pin set. Please type the street address below.');
            }
        } catch {
            onPickRef.current({ lat: la, lng: ln });
            toast.warning('Could not look up the address. Please type it below.');
        } finally {
            setBusy(false);
        }
    };

    const movePin = (la, ln, zoom) => {
        marker.current.setLatLng([la, ln]);
        map.current.setView([la, ln], zoom ?? map.current.getZoom());
        clearTimeout(timer.current);
        timer.current = setTimeout(() => reverse(la, ln), 500);
    };

    useEffect(() => {
        const start = lat && lng ? [lat, lng] : DEFAULT_CENTER;
        map.current = L.map(mapEl.current, { zoomControl: true }).setView(start, lat && lng ? 17 : 12);
        L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
            maxZoom: 19,
            attribution: '&copy; OpenStreetMap contributors',
        }).addTo(map.current);
        marker.current = L.marker(start, { draggable: true, icon: pinIcon }).addTo(map.current);
        marker.current.on('dragend', () => {
            const p = marker.current.getLatLng();
            movePin(p.lat, p.lng);
        });
        map.current.on('click', (e) => movePin(e.latlng.lat, e.latlng.lng));
        setTimeout(() => map.current && map.current.invalidateSize(), 200);
        return () => { clearTimeout(timer.current); map.current.remove(); };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const search = async () => {
        const q = query.trim();
        if (!q) return;
        setBusy(true);
        try {
            const r = await fetch(`${NOMINATIM}/search?format=jsonv2&addressdetails=1&countrycodes=ph&limit=5&q=${encodeURIComponent(q)}`, { headers: { 'Accept-Language': 'en' } });
            const data = await r.json();
            setResults(data);
            if (!data.length) toast.info('No match. Try a landmark, barangay or city, or drop the pin on the map.');
        } catch {
            toast.error('Search failed. Check your connection or drop the pin on the map.');
        } finally {
            setBusy(false);
        }
    };

    const choose = (res) => {
        setResults([]);
        setQuery('');
        const fields = toFields(res);
        setLabel(res.display_name || '');
        marker.current.setLatLng([fields.lat, fields.lng]);
        map.current.setView([fields.lat, fields.lng], 17);
        onPickRef.current(fields);
    };

    const locate = () => {
        if (!navigator.geolocation) return toast.error('Your browser does not support location.');
        setBusy(true);
        navigator.geolocation.getCurrentPosition(
            (pos) => { setBusy(false); movePin(pos.coords.latitude, pos.coords.longitude, 17); },
            () => { setBusy(false); toast.error('Could not get your location. Allow location access or search instead.'); },
            { enableHighAccuracy: true, timeout: 10000 },
        );
    };

    return (<div className="space-y-3">
      <div className="flex gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400"/>
          <input type="text" value={query} onChange={(e) => setQuery(e.target.value)} onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); search(); } }} placeholder="Search street, barangay, building or landmark" className="w-full pl-9 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#2C5F4F] text-sm"/>
        </div>
        <button type="button" onClick={search} disabled={busy} className="px-4 py-2 bg-[#2C5F4F] hover:bg-[#1F4437] text-white rounded-md text-sm font-medium disabled:opacity-50">Search</button>
        <button type="button" onClick={locate} disabled={busy} title="Use my current location" className="px-3 py-2 border border-[#2C5F4F] text-[#2C5F4F] hover:bg-emerald-50 rounded-md disabled:opacity-50"><LocateFixed className="w-4 h-4"/></button>
      </div>

      {results.length > 0 && (<ul className="border border-gray-200 rounded-md divide-y bg-white shadow-sm max-h-48 overflow-auto">
          {results.map((r) => (<li key={r.place_id}><button type="button" onClick={() => choose(r)} className="w-full text-left px-3 py-2 text-sm hover:bg-amber-50 flex gap-2"><MapPin className="w-4 h-4 text-[#D4A843] shrink-0 mt-0.5"/><span>{r.display_name}</span></button></li>))}
        </ul>)}

      <div className="relative rounded-lg overflow-hidden border border-gray-200">
        <div ref={mapEl} style={{ height: 280, width: '100%', zIndex: 0 }}/>
        {busy && (<div className="absolute top-2 right-2 bg-white/90 rounded-full px-3 py-1 text-xs flex items-center gap-1 shadow z-[500]"><Loader2 className="w-3 h-3 animate-spin"/> Finding address…</div>)}
      </div>
      <p className="text-xs text-gray-500">Drag the pin or tap the map to set your exact delivery spot. The address below fills in automatically, and you can still edit it.</p>
      {label && (<p className="text-xs text-gray-600 bg-gray-50 border border-gray-200 rounded-md px-3 py-2 flex gap-2"><MapPin className="w-4 h-4 text-[#D4A843] shrink-0"/>{label}</p>)}
    </div>);
}
