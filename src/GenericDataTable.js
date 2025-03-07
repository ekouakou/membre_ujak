import React, { useEffect, useState } from "react";
import $ from "jquery";
import "datatables.net";
import "datatables.net-responsive";
import "datatables.net-responsive-dt/css/responsive.dataTables.css";
import Swal from "sweetalert2";
import { toast, ToastContainer } from "react-toastify";


const GenericDataTable = ({
  data,
  columns,
  tableId,
  onEdit,
  onDelete,
  onToggleStatus,
  deleteConfirmMessage,
  toggleStatusConfirmMessage,
  handleApiCall
}) => {
  const [isLoading, setIsLoading] = useState(true);

  const initializeDataTable = () => {
    setIsLoading(true);
    const responsiveColumns = columns.map(column => ({
      ...column,
      responsive: column.responsive || true
    }));

    const table = $(`#${tableId}`).DataTable({
      data,
      columns: responsiveColumns,
      destroy: true,
      responsive: true,
      language: {
        // paginate: {
        //   next: "Suivant",
        //   previous: "Précédent",
        // },
        language:"fr"
      },
      initComplete: function() {
        setIsLoading(false);
      }
    });

    // Event handlers remain the same
    if (onEdit) {
      $(`#${tableId}`).on("click", ".action-edit", function () {
        const id = $(this).data("id");
        onEdit(id);
      });
    }

    if (onDelete) {
      $(`#${tableId}`).on("click", ".action-delete", function () {
        const id = $(this).data("id");
        Swal.fire({
          title: deleteConfirmMessage(id),
          icon: "warning",
          showCancelButton: true,
          confirmButtonText: "Oui",
          cancelButtonText: "Annuler",
        }).then((result) => {
          if (result.isConfirmed) {
            handleApiCall({
              mode: "delete",
              id,
              status: "delete",
            });
          }
        });
      });
    }

    if (onToggleStatus) {
      $(`#${tableId}`).on("click", ".action-toggle-status", function () {
        const id = $(this).data("id");
        const currentStatus = $(this).data("status");
        const newStatus = currentStatus === "enable" ? "disable" : "enable";

        Swal.fire({
          title: toggleStatusConfirmMessage(id, newStatus),
          icon: "warning",
          showCancelButton: true,
          confirmButtonText: "Oui",
          cancelButtonText: "Annuler",
        }).then((result) => {
          if (result.isConfirmed) {
            handleApiCall({
              mode: "updateStatus",
              id,
              status: newStatus,
            });
          }
        });
      });
    }
  };

  useEffect(() => {
    if (data.length > 0) {
      initializeDataTable();
    } else {
      setIsLoading(false);
    }
    
    return () => {
      const table = $(`#${tableId}`).DataTable();
      table.destroy();
    };
  }, [data]);

  return (
    <div id="table-responsive">
      <ToastContainer />
      <table
        id={tableId}
        className="table table-row-dashed align-middle gs-0 gy-6 my-0 display nowrap table-striped table-responsive"
        width="100%"
      >
        <thead>
          <tr>
            {columns.map((column, index) => (
              <th key={index}>{column.title}</th>
            ))}
          </tr>
        </thead>
      </table>
    </div>
  );
};

export default GenericDataTable;