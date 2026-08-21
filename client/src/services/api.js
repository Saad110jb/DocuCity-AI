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
  const res = await api.get('/map/zones');
  return res.data;
};

export const queryRagApi = async (query, language = 'en', zoneCode = null) => {
  const res = await api.post('/map/query', { query, language, zone_code: zoneCode });
  return res.data;
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

export default api;
