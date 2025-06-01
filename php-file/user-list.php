<?php include '../php-file/topbar.php'; ?>
<?php include '../php-file/sidebar.php'; ?>

<div class="card-body">
    <button class="btn btn-success" id="create-btn">Add user</button>
    <div class="table-responsive">
        <table class="table table-bordered" id="dataTable" cellspacing="0" style="overflow-x: hidden;">
            <thead>
                <tr>
                    <th>Sl. no</th>
                    <th>Name</th>
                    <th>Email</th>
                    <th>Address</th>
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
        const userList = async () => {
            try {
                const response = await getAjax(`${baseUrl}user/get`)
                console.log(response)
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
                        data: "Email",
                        orderable: true
                    },
                    {
                        data: "Address",
                        orderable: true
                    },
                    {
                        data: "CreateDate",
                        render: function(data, type, row, meta) {
                            return GetFormattedDate(row?.CreateDate ?? new Date())
                        },
                        orderable: true
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
                console.error(error)
                alert("Failed to load Data")
            }
        }
        $(document).ready(function() {
            userList()
        })
    })()
</script>