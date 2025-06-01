<?php include '../php-file/topbar.php'; ?>
<?php include '../php-file/sidebar.php'; ?>

<div class="card-body">
    <div>
        <button class="btn btn-success" id="categoris-create">Add Categories</button>
    </div>
    <div class="table-responsive">
        <table class="table table-bordered" id="dataTable" cellspacing="0" style="overflow-x: hidden;">
            <thead>
                <tr>
                    <th>Sl. No</th>
                    <th>Name</th>
                    <th>Created Date</th>
                    <th>Action</th>
                </tr>
            </thead>
            <tbody> </tbody>
        </table>
    </div>
</div>

<?php include '../php-file/footer.php'; ?>

<script>
    (function() {
        const categoryList = async () => {
            try {

                const response = await getAjax(`${baseUrl}categories/get`)
                let columns = [{
                        data: 'Id',
                        render: function(data, type, row, meta) {
                            return meta.row + meta.settings._iDisplayStart + 1
                        },
                        orderable: true
                    },
                    {
                        data: 'Name',
                        orderable: true,
                    },
                    {
                        data: 'CreateDate',
                        render: function(data, type, row, meta) {
                            return GetFormattedDate(row.CreateDate ?? new Date())
                        }
                    },
                    {
                        data: "Id",
                        render: function(data, type, row) {
                            return `
                        <button class="btn btn-sm btn-primary editBtn" data-id='${row.Id}'>Edit</button>
                        <button class="btn btn-sm btn-danger deleteBtn" data-id='${row.Id}'>Delete</button>
                        `
                        }
                    }
                ];
                configureTable('#dataTable', response?.data, columns)
            } catch (error) {
                console.error(error)
            }
        }

        const Delete = async function(id) {
            try {
                await deleteAjax(`${baseUrl}categories/delete/${id}`);
                categoryList();
            } catch (error) {
                console.error(error);
            }
        }

        const save = async (formdata) => {
            try {
                const response = await saveAjax(`${baseUrl}categories/create`, formdata);
                closeModal();
                categoryList();
            } catch (error) {
                console.error(error);
            }
        }

        const addCreateForm = async () => {
            try {
                const response = await getAjax(`./../php-file/categories-create.php`);
                openModal("Create Categories", response)
            } catch (error) {
                console.error(error);
            }
        }

        const update = async (formdata) => {
            try {
                const response = await updateAjax(`${baseUrl}categories/update/${formdata.Id}`, formdata);

                console.log(formdata);
                closeModal();
                categoryList();
                successMessage("Successfully Updated");
            } catch (error) {
                errorMessage(error);
            }
        }

        $('#updateItem').click(function() {
            const formdata = getFormData('categoryUpdate');
            update(formdata);
        })


        $("#categoris-create").click(function() {
            addCreateForm();
        })

        $('#saveItem').click(function() {
            const formdata = getFormData('categories-create');
            save(formdata);
        })


        $("#dataTable tbody").on("click", ".editBtn", async function() {
            const id = $(this).data("id");
            const response = await getAjax(`${baseUrl}categories/getById/${id}`);
            const update = await getAjax(`./../php-file/category_update.php`);
            openModal("Update Category", update, true);
            setFormData('categoryUpdate', response)
        });
        $("#dataTable").on("click", ".deleteBtn", function() {
            const id = $(this).data("id");
            if (confirm("Are you sure you want to delete this category?")) {
                Delete(id);
            }
        });


        $(document).ready(function() {
            categoryList();
        })
    })()
</script>