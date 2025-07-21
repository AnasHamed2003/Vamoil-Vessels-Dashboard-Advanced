import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Search, RefreshCw } from 'lucide-react';

const SearchPanel = ({
  searchType,
  setSearchType,
  searchValue,
  setSearchValue,
  handleSearch,
  loading,
  vessels,
  selectedVessel,
  onVesselSelect,
}) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Search className="h-5 w-5" />
          Search Vessels
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-2">Search Type</label>
          <select
            value={searchType}
            onChange={(e) => setSearchType(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
          >
            <option value="name">Vessel Name</option>
            <option value="mmsi">MMSI Number</option>
            <option value="area">Area Coordinates</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">
            {searchType === 'name' && 'Vessel Name'}
            {searchType === 'mmsi' && 'MMSI Number'}
            {searchType === 'area' && 'Coordinates (lat1,lon1,lat2,lon2)'}
          </label>
          <input
            type="text"
            value={searchValue}
            onChange={(e) => setSearchValue(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            placeholder={
              searchType === 'name'
                ? 'Enter vessel name...'
                : searchType === 'mmsi'
                ? 'Enter MMSI number...'
                : '25.0,55.0,26.0,56.0'
            }
            onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
          />
        </div>

        <Button
          onClick={handleSearch}
          disabled={loading || !searchValue.trim()}
          className="w-full"
        >
          {loading ? (
            <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
          ) : (
            <Search className="h-4 w-4 mr-2" />
          )}
          {loading ? 'Searching...' : 'Search'}
        </Button>

        {vessels.length > 0 && (
          <div className="mt-6">
            <h3 className="font-medium mb-3">Found {vessels.length} vessel(s)</h3>
            <div className="space-y-2 max-h-60 overflow-y-auto">
              {vessels.map((vessel, index) => (
                <div
                  key={index}
                  className={`p-3 border rounded-md cursor-pointer transition-colors ${
                    selectedVessel?.mmsi === vessel.mmsi
                      ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                      : 'border-gray-200 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-800'
                  }`}
                  onClick={() => onVesselSelect(vessel)}
                >
                  <p className="font-medium text-sm">{vessel.name}</p>
                  <p className="text-xs text-gray-600 dark:text-gray-400">
                    MMSI: {vessel.mmsi}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default SearchPanel;
