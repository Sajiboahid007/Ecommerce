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
