import { Card } from "./ui/card";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import { Map, MapPin, Compass } from "lucide-react";

interface Location {
  id: number;
  name: string;
  description: string;
  level: number;
  unlocked: boolean;
}

interface ExplorationPanelProps {
  currentLocation: number;
  locations: Location[];
  onTravel: (locationId: number) => void;
}

export function ExplorationPanel({
  currentLocation,
  locations,
  onTravel,
}: ExplorationPanelProps) {
  return (
    <Card className="p-4 bg-gradient-to-br from-slate-900 to-slate-800 border-cyan-600/30">
      <h2 className="text-cyan-400 flex items-center gap-2 mb-4">
        <Map className="w-5 h-5" />
        World Map
      </h2>

      <div className="space-y-3">
        {locations.map((location) => (
          <div
            key={location.id}
            className={`p-3 rounded-lg border transition-all ${
              currentLocation === location.id
                ? "bg-cyan-900/30 border-cyan-600/50"
                : location.unlocked
                ? "bg-slate-800/50 border-slate-700 hover:border-slate-600"
                : "bg-slate-800/30 border-slate-700/50 opacity-50"
            }`}
          >
            <div className="flex items-start justify-between mb-2">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  {currentLocation === location.id ? (
                    <MapPin className="w-4 h-4 text-cyan-400" />
                  ) : (
                    <Compass className="w-4 h-4 text-slate-500" />
                  )}
                  <h4 className="text-slate-200">{location.name}</h4>
                </div>
                <p className="text-sm text-slate-400 mb-2">
                  {location.description}
                </p>
              </div>
              <Badge
                variant="outline"
                className={
                  location.level <= 5
                    ? "border-green-600/50 text-green-400"
                    : location.level <= 10
                    ? "border-yellow-600/50 text-yellow-400"
                    : "border-red-600/50 text-red-400"
                }
              >
                Lv. {location.level}
              </Badge>
            </div>

            {location.unlocked ? (
              currentLocation !== location.id && (
                <Button
                  onClick={() => onTravel(location.id)}
                  size="sm"
                  className="w-full bg-cyan-600 hover:bg-cyan-700"
                >
                  <Compass className="w-4 h-4 mr-2" />
                  Travel Here
                </Button>
              )
            ) : (
              <div className="text-xs text-slate-500 text-center">
                🔒 Complete quests to unlock
              </div>
            )}

            {currentLocation === location.id && (
              <div className="text-sm text-cyan-400 text-center mt-2">
                📍 Current Location
              </div>
            )}
          </div>
        ))}
      </div>
    </Card>
  );
}
