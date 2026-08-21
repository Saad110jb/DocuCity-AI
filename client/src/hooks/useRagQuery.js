import { useState } from 'react';
import { queryRagApi } from '../services/api';

export function useRagQuery() {
  const [messages, setMessages] = useState([
    {
      id: 'welcome-1',
      sender: 'ai',
      text: 'Assalam-o-Alaikum! I am DocuCity AI, your intelligent assistant for Lahore Development Authority (LDA) bylaws, land zoning, FAR, and building rules. How can I assist your urban query today?',
      citations: [],
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }
  ]);
  const [loading, setLoading] = useState(false);
  const [language, setLanguage] = useState('en');

  const sendQuery = async (queryText, zoneCode = null) => {
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
      const response = await queryRagApi(queryText, language, zoneCode);
      
      const aiMsg = {
        id: `ai-${Date.now()}`,
        sender: 'ai',
        text: response.answer,
        language: response.language,
        citations: response.citations || [],
        suggestedFollowups: response.suggested_followups || [],
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };

      setMessages((prev) => [...prev, aiMsg]);
    } catch (err) {
      console.error('Error executing RAG query:', err);
      const errorMsg = {
        id: `error-${Date.now()}`,
        sender: 'ai',
        text: 'Sorry, I encountered an issue retrieving LDA bylaws. Please try asking again.',
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
    sendQuery
  };
}
