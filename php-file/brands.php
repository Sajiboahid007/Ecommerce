<!-- filepath: c:\xampp\htdocs\Ecommerce\pages\dashboard.php -->
<?php include '../php-file/topbar.php'; ?>
<?php include '../php-file/sidebar.php'; ?>

<div class="card-body">
    <div>
        <button class="btn btn-success" id="create-btn">Add Brands</button>
    </div>

    <div class="table-responsive mt-2">
        <table class="table table-bordered" id="dataTable" cellspacing="0" style="overflow-x: hidden;">
            <thead>
                <tr>
                    <th>Sl. No</th>
                    <th>Name</th>
                    <th>Image</th>
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
        window.edit = function(id) {
            console.log("Edit ID:", id);
        };

        const Delete = async function(id) {
            try {
                const response = await deleteAjax(`${baseUrl}brand/delete/${id}`);
                generateList();
            } catch (error) {
                console.error(error);
            }
        }

        const generateList = async () => {
            try {
                const response = await getAjax(`${baseUrl}brand/get`);
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
                        data: "Name",
                        render: function(data, type, row, meta) {
                            return '';
                        }
                    },
                    {
                        data: "CreateDate",
                        "render": function(data, type, row, meta) {
                            return GetFormattedDate(row?.CreateDate ?? new Date());
                        },
                        orderable: true
                    },
                    {
                        data: "Id",
                        render: function(data, type, row) {
                            return `
                                <button class="btn btn-sm btn-primary edit-btn" data-id="${row.Id}">Edit</button>
                                <button class="btn btn-sm btn-danger delete-btn" data-id="${row.Id}">Delete</button>
                            `;
                        }
                    }
                ];
                configureTable("#dataTable", response?.data, columns);
            } catch (error) {
                console.error(error);
            }
        }

        const addCreateForm = async () => {
            try {
                const response = await getAjax(`./../php-file/brands-create.php`)
                openModal("Create brands", response);
            } catch (error) {
                console.log(error)
            }
        }

        const save = async (FormData) => {
            try {
                const response = await saveAjax(`${baseUrl}brand/create`, FormData);
                closeModal();
                generateList();
            } catch (error) {
                console.error(error)
            }
        }


        $('#saveItem').click(function() {
            const formdata = getFormData('create-brands');
            save(formdata);
        })
        $('#create-btn').click(function() {
            addCreateForm();
        })


        $('#dataTable tbody').on('click', '.edit-btn', function() {
            let id = $(this).data("id");
            alert("Editing ID: " + id);
        });

        $('#dataTable tbody').on('click', '.delete-btn', function() {
            let id = $(this).data("id");
            if (confirm("Are you sure you want to delete ID: " + id + "?")) {
                Delete(id)
            }
        });

        $(document).ready(function() {
            generateList();
        })
    })();
</script>