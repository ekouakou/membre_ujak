import React, { useState, useRef, useCallback, useEffect } from 'react';
import html2canvas from 'html2canvas';
import { FaCalendarAlt, FaClock } from "react-icons/fa";
import { Uploader } from 'rsuite';
import './App.css';
import {
  Modal,
  Button,
  Placeholder,
  Loader,
  ButtonToolbar,
  Divider,
  Toggle, Stack
} from "rsuite";
import axios from 'axios'; // Importe axios
import userService from "./UserService";
import GenericDataTable from "./GenericDataTable";
import { getFullUrl } from "./apiService";


function App() {


  const [darkMode, setDarkMode] = useState(null);
  const [selectedImage, setSelectedImage] = useState(null);
  const [memberName, setMemberName] = useState("Nom-prenom");
  const [memberComment, setMemberComment] = useState("");
  const frameContainerRef = useRef(null);
  const [members, setMembers] = useState([]);


  const [open, setOpen] = React.useState(false);
  const handleOpen = () => setOpen(true);
  const handleClose = () => setOpen(false);

  const formatMemberName = (name) => {
    const parts = name.trim().split(" ");
    if (parts.length < 3) return name; // Si moins de 3 noms, afficher tel quel
    return `${parts[0]} ${parts[1]} ${parts[2].charAt(0)}.`;
  };

  const truncateText = (text, maxLength = 100) => {
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength).trim() + "...";
  };

  const applyGrayscale = (imageSrc) => {
    return new Promise((resolve) => {
      const img = new Image();
      img.crossOrigin = "anonymous";
      img.src = imageSrc;
      img.onload = () => {
        const canvas = document.createElement("canvas");
        const ctx = canvas.getContext("2d");
        canvas.width = img.width;
        canvas.height = img.height;

        ctx.drawImage(img, 0, 0);

        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const data = imageData.data;

        for (let i = 0; i < data.length; i += 4) {
          let avg = (data[i] + data[i + 1] + data[i + 2]) / 3;
          data[i] = avg;
          data[i + 1] = avg;
          data[i + 2] = avg;
        }

        ctx.putImageData(imageData, 0, 0);
        resolve(canvas.toDataURL());
      };
    });
  };

  // Handle image selection
  const handleImageUpload = useCallback((event) => {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = async () => {
        const grayscaleImage = await applyGrayscale(reader.result);
        setSelectedImage(grayscaleImage);
      };
      reader.readAsDataURL(file);
    }
  }, []);

  // Download framed image
  const handleDownload = useCallback(() => {
    if (frameContainerRef.current && selectedImage) {
      html2canvas(frameContainerRef.current, {
        useCORS: true,
        allowTaint: true,
        scale: 2,
        logging: false,
      })
        .then((canvas) => {
          const link = document.createElement("a");
          link.download = "membership-card.png";
          link.href = canvas.toDataURL("image/png");
          link.click();
        })
        .catch((error) => {
          console.error("Error capturing image:", error);
          alert("Failed to download image. Please try again.");
        });
    }
  }, [selectedImage]);

  // Charge les membres depuis le backend au montage du composant
  useEffect(() => {
    const fetchMembers = async () => {
      try {
        const response = await axios.get(getFullUrl() + 'add_member.php'); // URL de ton backend PHP
        setMembers(response.data);
      } catch (error) {
        console.error('Erreur lors de la récupération des membres:', error);
      }
    };

    fetchMembers();
  }, []);


  // Fonction pour enregistrer un membre
  // Fonction pour enregistrer un membre
  const saveMember = async () => {
    if (!memberName.trim() || !selectedImage) {
      alert("Veuillez fournir un nom et une photo");
      return;
    }

    // Créer un objet FormData
    const formData = new FormData();
    formData.append('name', memberName);
    formData.append('comment', memberComment);

    // Convertir l'image base64 en Blob
    const fetchResponse = await fetch(selectedImage);
    const blob = await fetchResponse.blob();

    // Ajouter le Blob comme fichier
    formData.append('photo', blob, 'photo.png');

    try {
      const response = await axios.post(getFullUrl() + 'add_member.php', formData, {
        headers: {
          'Content-Type': 'multipart/form-data' // Maintenant correct avec FormData
        }
      });

      if (response.data) {
        setMembers([...members, response.data]);
        // setMemberName("");
        // setMemberComment("");
        // setSelectedImage(null);
        alert('Membre enregistré avec succès.');
      }
    } catch (error) {
      console.error('Erreur lors de l\'enregistrement du membre:', error);
      alert('Erreur lors de l\'enregistrement du membre.');
    }
  };


  // Utilisez useEffect pour appliquer le thème sombre au montage et à chaque changement de darkMode
  useEffect(() => {
    if (darkMode) {
      document.body.classList.add('dark-mode');
    } else {
      document.body.classList.remove('dark-mode');
    }
  }, [darkMode]);

  const toggleDarkMode = () => {
    setDarkMode(!darkMode);
  };

  return (
    <div className={`app ${darkMode ? 'dark-mode' : ''}`}>

      <div className="auth-page-wrapper auth-bg-cover_ py-5 d-flex justify-content-center align-items-center min-vh-100">
        <div className="bg-overlay_" />
        {/* auth-page content */}
        <div className="auth-page-content overflow-hidden pt-lg-5">
          <div className="container">
            <div className="row">
              <div className="col-lg-12">
                <div className="card overflow-hidden galaxy-border-none card-bg-fill">
                  <div className="row justify-content-center g-0">
                    <div className="col-lg-6">
                      <div className="p-lg-5 p-4  h-100">
                        {/* Frame Container */}
                        <div
                          ref={frameContainerRef}
                          className="position-relative"
                          style={{
                            width: "100%",
                            paddingTop: "100%",
                            overflow: "hidden",
                            backgroundColor: "#000",
                          }}
                        >
                          {/* Uploaded Image */}
                          {selectedImage && (
                            <img
                              src={selectedImage}
                              alt="Uploaded"
                              className="position-absolute top-0  object-fit img-position custom-image-style"
                            />
                          )}

                          {/* {selectedImage && (
              <img
                src={selectedImage}
                alt="Uploaded"
                className="position-absolute top-0 start-0 end-0 w-100 h-100 object-fit-cover"
                style={{ zIndex: 1, paddingTop: "60px", width: "30% ",  maxWidth: "10%", }}
                //  style={{ zIndex: 1, paddingTop: "60px", width: "60% ",  maxWidth: "60%", }}
              />
            )} */}

                          {/* Frame Overlay */}
                          <img
                            // src={frameImage}
                            src="assets/images/26884774_7264393.png"
                            alt="Photo Frame"
                            className="position-absolute top-0 start-0 w-100 h-100 custom-frame-overlay"
                          />

                          {/* Logos and Text Overlay */}
                          <div className="position-wrapper">
                            {/* Right Side Content */}
                            <div className="right-side-content">
                              <div className="flex-column-container">
                                {/* Logo */}
                                <div className="logo-container">
                                  <img src="logo.png" alt="Heaterly Logo" />
                                </div>

                                {/* Membership Details */}
                                <div className="w-100">
                                  <h2 className="membership-title">UJAk</h2>
                                  <h3 className="membership-subtitle">
                                    Union des Jeunes d'Allah koffikro
                                  </h3>

                                  <div className=" membre">
                                    {/* <h3 className="">Membre</h3> */}
                                  </div>

                                  <h3 className="member-name">{formatMemberName(memberName)}</h3>

                                  <h5 className="my-3  member-description inter-light-italic">
                                    sera présent(e) à la réunion qui aura lieu à Modeste (GRAND-BASSAM)
                                  </h5>

                                  <div className={`${memberComment ? "d-flex  align-items-center gap-2" : "flex-column"}`}>
                                    <h3 className=" d-flex gap-2 m-0 text-white">
                                      <FaCalendarAlt className="fa-calendar-alt" /> <span className='info inter-regular'>22/03/2024</span>
                                    </h3>
                                    <h3 className={`d-flex gap-2  text-white ${memberComment ? "m-0" : "mt-2"}`}>
                                      <FaClock className="fa-clock" /> <span className='info inter-regular'>10H00</span>
                                    </h3>
                                  </div>

                                  {memberComment.trim() && (
                                    <>
                                      <h3 className="message-name ">Message</h3>
                                      <p className="comment-container text-break mt-1 text-capitalize-sentences">
                                        {truncateText(memberComment, 80)}
                                      </p>
                                    </>
                                  )}

                                </div>

                                {/* Website Link */}
                                <div className="website-link">
                                  {/* <a href="https://www.heaterly.com">
          WWW.<span className="text-white-color">HEATERLY.COM</span>
        </a> */}
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                    {/* end col */}
                    <div className="col-lg-6">
                      <div className="p-lg-5 p-4">
                        {/* <div>
                        <h5 className="text-primary">Lock Screen</h5>
                        <p className="text-muted">
                          Enter your password to unlock the screen!
                        </p>
                      </div> */}
                        <div className="user-thumb text-center">
                          <img
                            src="assets/images/users/avatar-1.jpg"
                            className="rounded-circle img-thumbnail avatar-lg material-shadow"
                            alt="thumbnail"
                          />
                          <h5 className="mt-3">S'enregistrer</h5>
                        </div>
                        <div className="mt-4">
                          <div className="mb-3">
                            <div className="mt-3">
                              <div className="row g-4">
                                {/* Photo du Membre */}
                                <div className="col-6">
                                  <div className="mb-3">
                                    <label htmlFor="memberPhoto" className="form-label">Photo</label>
                                    <span class="text-danger">*</span>
                                    <input
                                      type="file"
                                      className="form-control"
                                      accept="image/*"
                                      onChange={handleImageUpload}
                                    />
                                  </div>
                                </div>
                                {/* Nom du Membre */}
                                <div className="col-6">
                                  <div className="mb-3">
                                    <label htmlFor="memberName" className="form-label">Nom</label>
                                    <span class="text-danger">*</span>
                                    <input
                                      type="text"
                                      className="form-control"
                                      id="memberName"
                                      onChange={(e) => setMemberName(e.target.value)}
                                      placeholder="Entrez le nom du membre"
                                    />
                                  </div>
                                </div>
                              </div>

                              {/* Commentaire */}
                              <div className="mb-3">
                                <label htmlFor="memberComment" className="form-label">Commentaire</label>
                                <textarea
                                  className="form-control"
                                  id="memberComment"
                                  onChange={(e) => setMemberComment(e.target.value)}
                                  placeholder="Entrez un commentaire"
                                  rows="3"
                                />
                              </div>
                            </div>

                          </div>
                          <div className="mb-2 mt-4 d-flex gap-4">
                            <button className="btn btn-success w-100 btn-download" onClick={handleDownload}
                              disabled={!selectedImage}>

                              Télécharger l'image
                            </button>
                            <button className="btn btn-success w-100" onClick={saveMember} >
                              Enregistrer
                            </button>
                          </div>
                          <div class="mt-5 text-center">
                            <p class="mb-0">Voir la liste des membres <a class="fw-semibold text-primary text-decoration-underline" onClick={handleOpen}> Cliquer ici </a> </p>
                          </div>
                          {/* end form */}
                        </div>
                      </div>
                    </div>
                    {/* end col */}
                  </div>
                  {/* end row */}
                </div>
                {/* end card */}
              </div>
              {/* end col */}
            </div>
            {/* end row */}
          </div>
          {/* end container */}
        </div>
        {/* end auth page content */}
        {/* footer */}
        <footer className="footer galaxy-border-none">
          <div className="container">
            <div className="row">
              <div className="col-lg-12">
                <div className="text-center">
                  <Stack spacing={10} childrenRenderMode="clone">
                    <Toggle onChange={toggleDarkMode} size="md">Dark Mode</Toggle>
                  </Stack>
                  <p className="mb-0">
                    © MS-Dev <i className="mdi mdi mdi-heart text-danger" />{" "}

                  </p>
                </div>
              </div>
            </div>
          </div>
        </footer>
        {/* end Footer */}
      </div>

      <>
        <Modal open={open} onClose={handleClose} size="lg">
          <Modal.Header>
            <Modal.Title>Liste des membres</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <GenericDataTable
              data={members}
              columns={userService.getColumns()}
              tableId="eventTable"
            />
          </Modal.Body>
          <Modal.Footer>
            <Button onClick={handleClose} appearance="primary">
              Fermer
            </Button>
          
          </Modal.Footer>
        </Modal>
      </>

    </div>
  );
}

export default App;
