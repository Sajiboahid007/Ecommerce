const saveAjax = (url, jsonData) => {
  return new Promise((resolve, reject) => {
    $.ajax({
      url: url,
      type: "POST",
      data: JSON.stringify(jsonData),
      contentType: "application/json",
      success: function (data) {
        resolve(data);
      },
      error: function (err) {
        reject(err);
      },
    });
  });
};

const updateAjax = (url, jsonData) => {
  return new Promise((resolve, reject) => {
    $.ajax({
      url: url,
      type: "PUT",
      data: JSON.stringify(jsonData),
      contentType: "application/json",
      success: function (data) {
        resolve(data);
      },
      error: function (err) {
        reject(err);
      },
    });
  });
};

const getAjax = (url) => {
  return new Promise((resolve, reject) => {
    $.ajax({
      url: url,
      type: "GET",
      success: function (data) {
        resolve(data);
      },
      error: function (err) {
        reject(err);
      },
    });
  });
};

const deleteAjax = (url) => {
  return new Promise((resolve, reject) => {
    $.ajax({
      url: url,
      type: "DELETE",
      success: function (data) {
        resolve(data);
      },
      error: function (err) {
        reject(err);
      },
    });
  });
};
