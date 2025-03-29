<?php include '../php-file/topbar.php'; ?>
<?php include '../php-file/sidebar.php'; ?>

<div class="table-responsive">
    <h3 class="text-center">Variation</h3>
    <table class="table table-bordered" id="dataTable" cellspacing="0" style="overflow-x: hidden;">
        <thead>
            <tr>
                <th>SL No</th>
                <th>Type</th>
                <th>Create Date</th>
                <th>Action</th>
            </tr>
        </thead>
        <tbody></tbody>
    </table>
</div>

<?php include '../php-file/footer.php'; ?>

<script>
    (function() {
        const variationList = async () => {
            try {
                const response = await getAjax(`${baseUrl}variation/get`)
                console.log(response)
                let columns = [{
                        data: "Id",
                        render: function(data, type, row, meta) {
                            return meta.row + meta.settings._iDisplayStart + 1;
                        },
                        orderable: true
                    },
                    {
                        data: "Type",
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
                console.log(error)
                alert("Something went wrong")
            }
        }
        $(document).ready(() => {
            variationList()
        })
    })()
</script>