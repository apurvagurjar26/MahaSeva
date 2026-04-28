import { cn } from "../../lib/utils";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import { AlertCircle, MapPin } from "lucide-react";
import { renderToStaticMarkup } from "react-dom/server";

// Dynamic Icon Generator
const getColoredIcon = (color: string) => {
  const iconHtml = renderToStaticMarkup(
    <div className="relative flex items-center justify-center">
      <div 
        className="w-8 h-8 rounded-full border-2 border-white shadow-lg flex items-center justify-center"
        style={{ backgroundColor: color }}
      >
        <MapPin className="w-5 h-5 text-white" />
      </div>
      <div className="absolute -bottom-1 w-2 h-2 rotate-45" style={{ backgroundColor: color }} />
    </div>
  );

  return L.divIcon({
    html: iconHtml,
    className: "custom-pin",
    iconSize: [32, 38],
    iconAnchor: [16, 38],
    popupAnchor: [0, -38],
  });
};

const iconMap = {
  High: getColoredIcon("#dc2626"), // Red-600
  Mid: getColoredIcon("#f97316"),  // Orange-500
  Low: getColoredIcon("#fbbf24"),  // Yellow-400
};

const cityCoords: { [key: string]: [number, number] } = {
  "Mumbai": [19.0760, 72.8777],
  "Pune": [18.5204, 73.8567],
  "Nagpur": [21.1458, 79.0882],
  "Nashik": [19.9975, 73.7898],
  "Aurangabad": [19.8762, 75.3433],
  "Solapur": [17.6599, 75.9064],
  "Amravati": [20.9374, 77.7796],
  "Kolhapur": [16.7050, 74.2433],
  "Thane": [19.2183, 72.9781],
  "Akola": [20.7002, 77.0082],
  "Jalgaon": [21.0077, 75.5626],
  "Ratnagiri": [16.9944, 73.3000],
  "Satara": [17.6805, 73.9918],
  "Ahmednagar": [19.0948, 74.7480],
};

export default function MapPage({ problems }: { problems: any[] }) {
  const maharashtraCenter: [number, number] = [19.7515, 75.7139];

  return (
    <div className="h-full flex flex-col">
      <header className="p-10 border-b border-ink/10 text-left bg-white/50 backdrop-blur-md">
        <span className="font-sans text-[10px] uppercase tracking-[0.4em] text-gray-400 mb-2 block font-bold">Spatial Analysis Segment 004</span>
        <h2 className="text-4xl font-display font-bold">Regional Command Map</h2>
        <p className="font-display italic text-lg text-gray-500">Geographic visualization of state-wide mobilization imperatives.</p>
      </header>
      
      <div className="flex-1 relative z-0">
        <MapContainer 
          center={maharashtraCenter} 
          zoom={7} 
          className="w-full h-full"
          maxBounds={[[15, 72], [22, 81]]} // Rough bounds for Maharashtra
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          {problems.map(p => {
            const coords = cityCoords[p.location] || [19 + Math.random(), 75 + Math.random()];
            const icon = iconMap[p.level as keyof typeof iconMap] || iconMap.Low;
            return (
              <Marker key={p.id} position={coords} icon={icon}>
                <Popup className="custom-editorial-popup">
                  <div className="p-4 bg-white border border-ink/10 shadow-xl min-w-[200px]">
                    <span className="font-sans text-[8px] uppercase tracking-[0.2em] text-gray-400 block mb-1">Threat Registry</span>
                    <h4 className="font-display font-bold text-lg text-ink mb-1 group-hover:text-saffron transition-colors italic leading-tight">{p.title}</h4>
                    <p className="font-sans text-[10px] uppercase tracking-widest text-gray-500 mb-4">{p.location}</p>
                    <div className="flex gap-2 border-t border-ink/5 pt-3">
                      <span className={cn(
                        "font-sans text-[9px] font-bold uppercase tracking-widest px-2 py-1 border",
                        p.level === 'High' ? "border-red-600 text-red-600 bg-red-50" : 
                        p.level === 'Mid' ? "border-orange-500 text-orange-500 bg-orange-50" :
                        "border-yellow-400 text-yellow-600 bg-yellow-50"
                      )}>
                        {p.level} Priority
                      </span>
                      <span className="font-sans text-[9px] font-bold uppercase tracking-widest px-2 py-1 border border-ink text-ink bg-paper">
                        {p.field}
                      </span>
                    </div>
                  </div>
                </Popup>
              </Marker>
            )
          })}
        </MapContainer>

        {/* Legend */}
        <div className="absolute bottom-10 right-10 bg-white/90 backdrop-blur-md p-6 border border-ink/10 z-[1000] shadow-2xl">
          <h5 className="font-sans text-[10px] font-bold uppercase tracking-[0.3em] text-gray-400 mb-6 block border-b border-ink/5 pb-2">Priority Heatmap Legend</h5>
          <div className="flex flex-col gap-6">
            <div className="flex items-center gap-4 group">
               <div className="w-4 h-4 rounded-full bg-[#dc2626] border-2 border-white shadow-md group-hover:scale-125 transition-transform" />
               <div className="flex flex-col">
                 <span className="font-sans text-[9px] font-bold uppercase tracking-widest text-ink">High Priority</span>
                 <span className="font-sans text-[7px] text-gray-400 uppercase tracking-widest font-bold">Critical Intervention Required</span>
               </div>
            </div>
            <div className="flex items-center gap-4 group">
               <div className="w-4 h-4 rounded-full bg-[#f97316] border-2 border-white shadow-md group-hover:scale-125 transition-transform" />
               <div className="flex flex-col">
                 <span className="font-sans text-[9px] font-bold uppercase tracking-widest text-ink">Mid Priority</span>
                 <span className="font-sans text-[7px] text-gray-400 uppercase tracking-widest font-bold">Serious Social Hazard</span>
               </div>
            </div>
            <div className="flex items-center gap-4 group">
               <div className="w-4 h-4 rounded-full bg-[#fbbf24] border-2 border-white shadow-md group-hover:scale-125 transition-transform" />
               <div className="flex flex-col">
                 <span className="font-sans text-[9px] font-bold uppercase tracking-widest text-ink">Low Priority</span>
                 <span className="font-sans text-[7px] text-gray-400 uppercase tracking-widest font-bold">Community Improvement</span>
               </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
