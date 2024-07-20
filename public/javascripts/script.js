const deleteBtn = document.getElementById("deleteBtn");

deleteBtn.addEventListener("click", () => {
  alert("Do you really want to delete this copy? This action is irreversible");
  if (alert) return;
});
