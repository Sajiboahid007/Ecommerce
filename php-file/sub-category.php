<?php include '../php-file/topbar.php'; ?>
<?php include '../php-file/sidebar.php'; ?>
<div class="card-body">
    <div class="row">
        <div class="col-sm-3">
            <button class="btn btn-success" id="create-btn">Add Sub Categories</button>
        </div>

        <h3 class="col-sm-6 text-center">Sub Categories</h3>
    </div>

    <div class="table-responsive">
        <table class="table table-bordered" id="dataTable" cellspacing="0" style="overflow-x: hidden;">
            <thead>
                <tr>
                    <th>Sl. No</th>
                    <th>Name</th>
                    <th>Category Name</th>
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
        const subCategoryList = async () => {
            try {
                const response = await getAjax(`${baseUrl}subcategories/get`);
                let columns = [{
                        data: "Id",
                        render: function(data, type, row, meta) {
                            return meta.row + meta.settings._iDisplayStart + 1;
                        },
                        orderable: true
                    },
                    {
                        data: "Name",
                        orderable: true
                    },
                    {
                        data: "Categories.Name",
                        orderable: true
                    },
                    {
                        data: "CreateDate",
                        render: function(data, type, row, meta) {
                            return GetFormattedDate(row?.CreateDate ?? new Date())
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
                ]
                configureTable("#dataTable", response?.data, columns)
            } catch (error) {
                console.error(error);
                alert("Failed to load Data")
            }
        }

        const Delete = async (id) => {
            try {
                await deleteAjax(`${baseUrl}subcategories/delete/${id}`);
                subCategoryList();
            } catch (error) {
                console.error(error);
            }
        }
        const addCreateForm = async () => {
            try {
                const response = await getAjax(`./../php-file/subcategories-create.php`);
                openModal("Create Subcategories", response)
            } catch (error) {
                console.error(error)
            }
        }

        const save = async (formData) => {
            try {
                const response = await saveAjax(`${baseUrl}subcategories/create`, formData)
                closeModal();
                subCategoryList()
            } catch (error) {
                console.error(error)
            }
        }

        $("#saveItem").click(function() {
            const formData = getFormData('subcategories-create');
            save(formData);
        })

        $("#create-btn").click(function() {
            addCreateForm();
        })

        $("#dataTable tbody").on('click', '.deleteBtn', function() {
            let id = $(this).data('id');
            if (confirm("Are you sure you want to delete ID: " + id + "?")) {
                Delete(id)
            }
        })

        $(document).ready(function() {
            subCategoryList();
        })
    })()
</script>