import React from 'react';
import { MapContainerComponent } from '../components/map/MapContainer';
import { ChatDrawer } from '../components/chat/ChatDrawer';
import { useMapLayers } from '../hooks/useMapLayers';
import { useRagQuery } from '../hooks/useRagQuery';

export function DashboardPage() {
  const { geoJsonData, selectedZone, setSelectedZone } = useMapLayers();
  const { messages, loading, language, setLanguage, sendQuery } = useRagQuery();

  return (
    <div className="relative w-full h-[calc(100vh-4rem)] overflow-hidden flex">
      {/* Main Interactive Leaflet GIS Map */}
      <div className="flex-1 h-full relative">
        <MapContainerComponent
          geoJsonData={geoJsonData}
          selectedZone={selectedZone}
          setSelectedZone={setSelectedZone}
          onAskRag={(queryText, zCode) => sendQuery(queryText, zCode)}
        />
      </div>

      {/* RAG QA Side Drawer */}
      <ChatDrawer
        messages={messages}
        loading={loading}
        language={language}
        setLanguage={setLanguage}
        onSendQuery={sendQuery}
        selectedZone={selectedZone}
      />
    </div>
  );
}
