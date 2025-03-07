// src/services/apiService.js

import axios from 'axios';

const getFullUrl = () => {
  const { protocol, hostname, port } = window.location;
  const portPart = port ? `:${port}` : '';
  // return `${protocol}//${hostname}/php-backend/`;
  // return "http://localhost:8888/php-backend/";
  return "https://br-immobilier.ci/php-backend/";

};

const crudData = (params,apiUrl) => {
  return axios.post(`${getFullUrl()}${apiUrl}`, params, {
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded'
    }
  });
};

export {  crudData, getFullUrl};
