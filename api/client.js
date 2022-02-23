/* eslint-disable prettier/prettier */
import { create } from 'apisauce';
export const BASE_URL = 'https://anugraam.com/public/index.php/api/';

// baseURL: 'https://delivery-app.ripungupta.com/backend/public/api/',
// baseURL: 'https://staging.tauruspress.co.uk/backend/public/api/',

const apiClient = create({
  baseURL: BASE_URL,
  headers: {
    'x-api-key': 'WzXiux3SkPgm7bZe',
  },
});
export default apiClient;
