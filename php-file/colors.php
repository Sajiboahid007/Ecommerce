<?php include '../php-file/topbar.php'; ?>
<?php include '../php-file/sidebar.php'; ?>
<div class="card-body">
    <div class="table-responsive">
        <table class="table table-bordered" id="datatable">
            <thead>
                <tr>
                    <th>Sl.no</th>
                    <th>Name</th>
                    <th>Color Code</th>
                    <th>Create Date</th>
                    <th>Action</th>
                </tr>
            </thead>
            <tbody></tbody>
        </table>
    </div>

</div>
<?php include '../php-file/footer.php'; ?>

<script>
    (function() {
        const generateColorList = async () => {
            try {
                const response = await getAjax(`${baseUrl}color/get`);
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
                        data: "ColorCode",
                        orderable: true
                    },
                    {
                        data: "CreateDate",
                        render: function(data, type, row, meta) {
                            return GetFormattedDate(row?.CreateDate ?? new date())
                        },
                        orderable: true
                    },
                    {
                        data: "Id",
                        render: function(data, type, row) {
                            return `
                               <button class="btn btn-sm btn-primary edit-btn" data-id="${row.Id}">Edit</button>
                                <button class="btn btn-sm btn-danger delete-btn" data-id="${row.Id}">Delete</button>
                            `
                        }
                    }
                ];
                configureTable("#datatable", response?.data, columns)
            } catch (error) {
                console.log(error)
            }
        }

        const Delete = async (id) => {
            console.log(id)
            try {
                await deleteAjax(`${baseUrl}color/delete/${id}`);
                generateColorList();
                alert("Deleted!")
            } catch (error) {
                console.log(error);
            }
        }

        $('#datatable tbody').on('click', '.delete-btn', function() { // Corrected selector
            let id = $(this).data("id");
            if (confirm("Are you sure you want to delete ID: " + id + "?")) {
                Delete(id);
            }
        });

        $(document).ready(function() {
            generateColorList();
        })
    })()
</script>