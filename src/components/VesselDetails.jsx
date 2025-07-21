import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Ship, Navigation } from 'lucide-react';
import { getVesselIcon, formatSpeed, formatCoordinates } from '../utils/aisApiService';

const VesselDetails = ({ vessel, onGetTrack, loading }) => {
  if (!vessel) {
    return (
      <Card className="mt-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Ship className="h-5 w-5" />
            Vessel Details
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-gray-500">Select a vessel to see its details.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="mt-6">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Ship className="h-5 w-5" />
          {vessel.name}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 gap-3 text-sm">
          <DetailRow label="MMSI" value={vessel.mmsi} />
          <DetailRow label="IMO" value={vessel.imo} />
          <DetailRow label="Type" value={`${getVesselIcon(vessel.type)} ${vessel.type}`} />
          <DetailRow label="Flag" value={vessel.flag} />
          <DetailRow label="Callsign" value={vessel.callsign} />
          <DetailRow label="Status" value={vessel.status} />
          <DetailRow label="Speed" value={formatSpeed(vessel.speed)} />
          <DetailRow label="Course" value={`${vessel.course}°`} />
          <DetailRow label="Heading" value={`${vessel.heading}°`} />
          <DetailRow label="Destination" value={vessel.destination} />
          <DetailRow label="ETA" value={vessel.eta} />
          <DetailRow label="Draught" value={`${vessel.draught} m`} />
          <DetailRow label="Dimensions" value={`${vessel.length}m x ${vessel.width}m`} />
          <DetailRow label="Position" value={formatCoordinates(vessel.latitude, vessel.longitude)} />
          <DetailRow label="Last Update" value={new Date(vessel.timestamp).toLocaleString()} />
        </div>

        <div className="pt-4 border-t">
          <Button
            onClick={() => onGetTrack(vessel)}
            disabled={loading}
            className="w-full mb-2"
          >
            <Navigation className="h-4 w-4 mr-2" />
            {loading ? 'Loading Track...' : 'Show Track'}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

const DetailRow = ({ label, value }) => (
  <div className="flex justify-between">
    <span className="font-medium text-gray-600 dark:text-gray-400">{label}:</span>
    <span className="text-right">{value || 'N/A'}</span>
  </div>
);

export default VesselDetails;
