// eventService.js
import axios from "axios";
import { getFullUrl } from "./apiService";


class UserService {
  constructor() {
    this.endPoint = process.env.REACT_APP_CONFIGURATION_MANAGER_API_URL;
  }



  // async getEvents(navigate, dateRange = { start: "2020-01-01", end: "2025-08-31" }) {
  //   try {
  //       // fetchData({ mode: 'listUtilisateur', STR_UTITOKEN: user.STR_UTITOKEN, LG_PROID: user.LG_PROID}, apiUrl, setEventData);

  //     const response = await crudData(
  //       { mode: 'listUtilisateur', STR_UTITOKEN: user.STR_UTITOKEN, LG_PROID: user.LG_PROID},
  //       this.endPoint
  //     );
  //     return response.data?.data || [];
  //   } catch (error) {
  //     console.error("Erreur lors de la récupération des événements:", error);
  //     return [];
  //   }
  // }

  // async updateEventStatus(navigate, eventId, status) {
  //   try {
  //     await crudData(
  //       {
  //         mode: "deleteUtilisateur",
  //         LG_UTIID: eventId,
  //         STR_UTISTATUT: status,
  //         STR_UTITOKEN: user.STR_UTITOKEN,
  //       },
  //       this.endPoint
  //     );
  //     return true;
  //   } catch (error) {
  //     console.error("Erreur lors de la mise à jour du statut:", error);
  //     return false;
  //   }
  // }

  async deleteEvent(navigate, eventId) {
    return this.updateEventStatus(navigate, eventId, "delete");
  }



  getColumns() {
    return [
      { data: "id", title: "N°", width: "5%" }, // Colonne plus petite
      {
        data: "name",
        title: "Nom & prénom",
        width: "25%", // Largeur plus grande pour le nom et la photo
        render: (data, type, row) => `
          <div class="d-flex align-items-center">
            <img src="${getFullUrl() + row.photo}" alt="" style="width: 40px; height: 40px; margin-right: 10px"/> 
            <span>${data}</span>
          </div>
        `,
      },
      { data: "comment", title: "Commentaire", width: "50%" },
      { data: "date_added", title: "Date", width: "15%" },
      { data: "time_added", title: "Heure", width: "10%" },
    ];
  }
  
}

export const userService = new UserService();
export default userService;





