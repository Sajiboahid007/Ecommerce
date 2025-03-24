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
