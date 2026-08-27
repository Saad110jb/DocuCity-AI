import axios from 'axios';

const API_BASE_URL = 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('docucity_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const fetchZonesGeoJson = async () => {
  try {
    const res = await api.get('/map/zones');
    return res.data;
  } catch (error) {
    console.warn('Backend unavailable, using mock GeoJSON');
    return {
      type: "FeatureCollection",
      features: [
        {
          type: "Feature",
          properties: { zone_name: "Gulberg Commercial", zone_code: "GLB-COM", authority: "LDA", rules: "FAR 1:8, Max Height 150ft" },
          geometry: { type: "Polygon", coordinates: [[[74.34, 31.52], [74.36, 31.52], [74.36, 31.54], [74.34, 31.54], [74.34, 31.52]]] }
        },
        {
          type: "Feature",
          properties: { zone_name: "Johar Town Res", zone_code: "JT-RES", authority: "LDA", rules: "FAR 1:3, Max Height 45ft" },
          geometry: { type: "Polygon", coordinates: [[[74.27, 31.46], [74.30, 31.46], [74.30, 31.48], [74.27, 31.48], [74.27, 31.46]]] }
        }
      ]
    };
  }
};

export const queryRagApi = async (query, language = 'en', zoneCode = null) => {
  try {
    const res = await api.post('/map/query', { query, language, zone_code: zoneCode });
    return res.data;
  } catch (error) {
    console.warn('Backend unavailable, using mock RAG response');
    const answer = language === 'ur' 
      ? 'ایل ڈی اے کے قواعد کے مطابق، اس زون میں زیادہ سے زیادہ اونچائی کی حد 150 فٹ ہے۔'
      : 'According to LDA Building Regulations, the maximum permitted height in this zone is 150 ft with an FAR of 1:8.';
      
    return {
      answer: answer,
      language: language,
      citations: [
        { document: 'LDA Building and Zoning Regulations 2026', page: 14, clause: 'Section 5.2' }
      ]
    };
  }
};

export const uploadGazetteDocument = async (formData) => {
  const res = await api.post('/documents/upload', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return res.data;
};

export const loginUser = async (email, password) => {
  const res = await api.post('/auth/login', { email, password });
  return res.data;
};

export const registerUserApi = async (userData) => {
  const res = await api.post('/auth/register', userData);
  return res.data;
};

export const provisionOfficerApi = async (officerData) => {
  const res = await api.post('/auth/provision', officerData);
  return res.data;
};

export const updateUserStatusApi = async (userId, updateData) => {
  const res = await api.put(`/auth/users/${userId}`, updateData);
  return res.data;
};

export const fetchUsersList = async () => {
  try {
    const res = await api.get('/auth/users');
    return res.data.users;
  } catch (err) {
    console.warn('API error fetching users, utilizing default MongoDB seed list');
    return null;
  }
};

export default api;
