const getFormData = (formId) => {
  const form = document.getElementById(formId);
  const formData = {};

  for (let i = 0; i < form.elements.length; i++) {
    const field = form.elements[i];
    if (field.name) {
      if (field.type === "checkbox") {
        formData[field.name] = field.checked ? true : false;
      } else if (field.type === "date") {
        formData[field.name] = new Date(field.value);
      } else {
        formData[field.name] = field.value;
      }
    }
  }
  return formData;
};

function setFormData(formId, response) {
  const form = document.getElementById(formId);
  if (Array.isArray(response)) {
    response = response[0];
  }

  for (const key in response) {
    const input = form.querySelector(`[name="${key}"], [id="${key}"]`);
    if (input) {
      if (input?.type === "date") {
        input.value = getFormattedDateForInput(response[key]); // new Date(response[key]);
      } else {
        input.value = response[key];
      }
    }
  }
}

function getFormattedDateForInput(inputDate) {
  var dateObj = new Date(inputDate);

  // Format the date to mm/dd/yy
  var formattedDate =
    ("0" + (dateObj.getMonth() + 1)).slice(-2) +
    "/" +
    ("0" + dateObj.getDate()).slice(-2) +
    "/" +
    dateObj.getFullYear().toString().slice(-2);

  var isoFormattedDate = dateObj.toISOString().split("T")[0];
  return isoFormattedDate;
}

function GetFormattedDate(dateString) {
  const date = new Date(dateString);
  // Extract parts
  const day = String(date.getDate()).padStart(2, "0");
  const monthNames = [
    "Jan",
    "Feb",
    "Mar",
    "Apr",
    "May",
    "Jun",
    "Jul",
    "Aug",
    "Sep",
    "Oct",
    "Nov",
    "Dec",
  ];
  const month = monthNames[date.getMonth()];
  const year = date.getFullYear();
  const hours = String(date.getHours()).padStart(2, "0");
  const minutes = String(date.getMinutes()).padStart(2, "0");
  const seconds = String(date.getSeconds()).padStart(2, "0");

  return `${day}-${month}-${year} ${hours}:${minutes}:${seconds}`;
}

const baseUrl = "http://localhost:3000/";

function destroyDataTableIfExists(tableId) {
  if ($.fn.DataTable.isDataTable(tableId)) {
    $(tableId).DataTable().destroy();
  }
}

function configureTable(tableId, data, columns) {
  destroyDataTableIfExists(tableId);

  $(tableId).DataTable({
    responsive: true,
    paging: true,
    searching: true,
    ordering: true,
    lengthMenu: [
      [10, 50, 100, -1],
      [10, 50, 100, "All"],
    ],
    pageLength: 10,
    dom: '<"top-wrapper d-flex justify-content-between align-items-center"lBf>rtip',
    buttons: [
      {
        extend: "copyHtml5",
        text: "Copy", // Plain text label
        className: "btn btn-sm btn-primary", // Bootstrap button classes
      },
      {
        extend: "excelHtml5",
        text: "Excel",
        className: "btn btn-sm btn-success",
      },
      {
        extend: "csvHtml5",
        text: "CSV",
        className: "btn btn-sm btn-info",
      },
      {
        extend: "pdfHtml5",
        text: "PDF",
        className: "btn btn-sm btn-danger",
      },
      {
        extend: "print",
        text: "Print",
        className: "btn btn-sm btn-secondary",
      },
    ],
    columns: columns,
    data: data,
    columnDefs: [{ className: "text-center", targets: "_all" }],
  });
}

//modal section

const openModal = (title, htmlData, isUpdated = false, isPrint = false) => {
  $("#addNewItem").modal({
    backdrop: "static",
    keyboard: false,
  });
  $("#addNewModalTitle").text(title);
  $("#modalBody").html(htmlData);
  if (isPrint === true) {
    $("#printItem").show();
    $("#saveItem").hide();
    $("#updateItem").hide();
  } else {
    $("#printItem").hide();
    if (isUpdated) {
      $("#saveItem").hide();
      $("#updateItem").show();
    } else {
      $("#saveItem").show();
      $("#updateItem").hide();
    }
  }
  $("#addNewItem").modal("show");
};

const closeModal = () => {
  $("#addNewItem").modal("hide");
  $("#modalBody").html("");
};

$("#addNewItemCloseButton").click(function () {
  closeModal();
});

$("#addNewItemCrossButton").click(function () {
  closeModal();
});

const successMessage = (message = "Successfully Saved") => {
  Swal.fire({
    position: "center",
    icon: "success",
    title: message,
    showConfirmButton: false,
    timer: 1500,
  });
};

const errorMessage = (error) => {
  let message = "Something went wrong!";
  if (error?.responseJSON?.message) {
    message = error?.responseJSON?.message;
  } else if (error?.statusText) {
    message = error?.statusText;
  } else if (error?.message) {
    message = error?.message;
  }

  Swal.fire({
    position: "center",
    icon: "error",
    title: message,
    showConfirmButton: false,
    timer: 1500,
  });
};

const deleteConfirmation = () => {
  return new Promise((resolve, reject) => {
    Swal.fire({
      title: "Are you sure?",
      text: "You won't be able to revert this!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
      confirmButtonText: "Yes, delete it!",
    }).then((result) => {
      if (result.isConfirmed) {
        resolve(true);
      } else {
        reject(true);
      }
    });
  });
};
