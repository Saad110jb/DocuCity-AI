import { useState, useEffect, useRef } from 'react';
import { queryRagApi } from '../services/api';

export function useRagQuery(selectedZone = null) {
  const [messages, setMessages] = useState([
    {
      id: 'welcome-1',
      sender: 'ai',
      text: 'Assalam-o-Alaikum! I am DocuCity AI, your intelligent municipal assistant for Lahore Development Authority (LDA), WASA, MCL, and Punjab Urban Unit bylaws. Click any zone or coordinate on the map to tailor all answers to that exact location!',
      citations: [
        {
          document_title: 'LDA Building & Zoning Regulations 2026',
          clause: 'General Regulations & Gazette Enactments',
          page: 1,
          snippet: 'Official Master Regulations for Lahore Metropolitan District.',
          gazette_ref: 'Punjab Gazette Notification'
        }
      ],
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }
  ]);
  const [loading, setLoading] = useState(false);
  const [language, setLanguage] = useState('en');
  const [suggestedPrompts, setSuggestedPrompts] = useState([
    'What is the FAR in Gulberg commercial plots?',
    'Height limit for residential buildings in Johar Town?',
    'Setback requirements for Mall Road Heritage zone?'
  ]);

  const lastZoneRef = useRef(null);

  // When citizen selects any area on the map, update chatbot context automatically
  useEffect(() => {
    if (!selectedZone) return;
    const zoneKey = selectedZone.zone_code || selectedZone.zone_name;
    if (lastZoneRef.current === zoneKey) return;
    lastZoneRef.current = zoneKey;

    const isUrdu = language === 'ur';
    const zoneName = selectedZone.zone_name || selectedZone.name || 'Selected Location';
    const authority = selectedZone.authority || selectedZone.department || 'LDA';
    const far = selectedZone.far || '1:4';
    const height = selectedZone.max_height_ft ? `${selectedZone.max_height_ft} ft` : '38 ft (G+2)';
    const setbackFront = selectedZone.setback_front_ft ? `${selectedZone.setback_front_ft} ft compulsory` : '10 ft';
    const commercialStatus = selectedZone.commercialization_status || 'Subject to LDA Gazette';

    const contextMsg = {
      id: `zone-context-${Date.now()}`,
      sender: 'ai',
      isContextBanner: true,
      text: isUrdu
        ? `📍 **نیا علاقہ منتخب کیا گیا: ${zoneName}** (${authority})\n` +
          `• **فلور ایریا ریشو (FAR)**: ${far}\n` +
          `• **زیادہ سے زیادہ اونچائی**: ${height}\n` +
          `• **فرنٹ سیٹ بیک**: ${setbackFront}\n` +
          `• **کمرشلائزیشن**: ${commercialStatus}\n\n` +
          `میں نے اپنے تمام جوابات اس مخصوص زون کے قواعد و ضوابط کے مطابق ترتیب دے دیے ہیں۔ نیچے دیا گیا کوئی بھی سوال پوچھیں!`
        : `📍 **Spatial Location Filter Locked: ${zoneName}** (${authority})\n` +
          `• **Permitted FAR**: ${far}\n` +
          `• **Max Height**: ${height}\n` +
          `• **Front Road Setback**: ${setbackFront}\n` +
          `• **Commercialization Status**: ${commercialStatus}\n\n` +
          `DocuCity AI is now contextualized to this exact area. Ask any question regarding building rules, setbacks, fees, or WASA connections!`,
      citations: [
        {
          document_title: `${authority} Spatial Zoning Gazette`,
          clause: selectedZone.gazette_reference || 'LDA Land Use Rules 2020/2026',
          page: 1,
          snippet: `Enacted bylaws for ${zoneName}: FAR ${far}, Height ${height}, Setback ${setbackFront}.`,
          gazette_ref: selectedZone.gazette_reference || 'Punjab Gazette'
        }
      ],
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages((prev) => [...prev, contextMsg]);

    // Update dynamic suggested prompt chips
    const shortName = zoneName.split(' ')[0];
    if (isUrdu) {
      setSuggestedPrompts([
        `${shortName} میں عمارت کی اونچائی کی کیا حد ہے؟`,
        `${shortName} میں کمرشلائزیشن فیس کا کیا اصول ہے؟`,
        `کیا ${shortName} میں واسا سیوریج بفر لاگو ہوتا ہے؟`
      ]);
    } else {
      setSuggestedPrompts([
        `What is the maximum building height allowed in ${shortName}?`,
        `What are the road setback & open space rules for ${shortName}?`,
        `What is the commercial conversion fee in ${shortName}?`
      ]);
    }
  }, [selectedZone, language]);

  const sendQuery = async (queryText, zoneCodeOverride = null) => {
    if (!queryText.trim()) return;

    const userMsg = {
      id: `user-${Date.now()}`,
      sender: 'user',
      text: queryText,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages((prev) => [...prev, userMsg]);
    setLoading(true);

    try {
      const activeZoneCode = zoneCodeOverride || (selectedZone && selectedZone.zone_code);
      const activeJurisdiction = selectedZone && (selectedZone.zone_name || selectedZone.name);
      const activeCoords = selectedZone && selectedZone.clickedCoords;

      const response = await queryRagApi(
        queryText,
        language,
        activeZoneCode,
        activeJurisdiction,
        selectedZone,
        activeCoords
      );
      
      const aiMsg = {
        id: `ai-${Date.now()}`,
        sender: 'ai',
        text: response.answer,
        language: response.language,
        citations: response.citations || [],
        suggestedFollowups: response.suggested_followups || [],
        spatialFilter: response.spatial_filter || activeJurisdiction,
        engine: response.engine,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };

      setMessages((prev) => [...prev, aiMsg]);

      if (response.suggested_followups && response.suggested_followups.length > 0) {
        setSuggestedPrompts(response.suggested_followups);
      }
    } catch (err) {
      console.error('Error executing RAG query:', err);
      const errorMsg = {
        id: `error-${Date.now()}`,
        sender: 'ai',
        text: language === 'ur'
          ? 'معذرت، بائی لاز کا جواب لانے میں مسئلہ پیش آیا۔ براہ کرم دوبارہ کوشش کریں۔'
          : 'Sorry, I encountered an issue retrieving LDA bylaws. Please try asking again.',
        citations: [],
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      setMessages((prev) => [...prev, errorMsg]);
    } finally {
      setLoading(false);
    }
  };

  return {
    messages,
    loading,
    language,
    setLanguage,
    suggestedPrompts,
    sendQuery
  };
}
