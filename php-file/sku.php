<?php include '../php-file/topbar.php'; ?>
<?php include '../php-file/sidebar.php'; ?>
<div class="table-responsive">
    <div>
        <button class="btn btn-success" id="create-btn"> Add Sku </button>
    </div>
    <table class="table table-bordered" id="datatable">
        <thead class="text-center">
            <tr>
                <th>Sl No</th>
                <th>Name</th>
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
        const skuList = async () => {
            try {
                const response = await getAjax(`${baseUrl}sku/get`)
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
                        <button class="btn btn-sm btn-primary edit-btn" data-id='${row.Id}'>Edit</button>
                        <button class="btn btn-sm btn-danger delete-btn" data-id='${row.Id}'>Delete</button>
                        `
                        }
                    }
                ]
                configureTable("#datatable", response?.data, columns)
            } catch (error) {
                console.log(error)
                alert("Something went wrong")
            }
        }

        const Delete = async (id) => {
            try {
                await deleteAjax(`${baseUrl}sku/delete/${id}`);
                skuList();
            } catch (error) {
                console.error(eerror)
            }
        }
        const addCreateForm = async () => {
            try {
                const response = await getAjax(`./../php-file//sku-create.php`);
                openModal("Create Subcategories", response)
            } catch (error) {
                console.error(error)
            }
        }

        const save = async (formData) => {
            try {
                const response = await saveAjax(`${baseUrl}sku/create`, formData);
                closeModal()
                skuList()
            } catch (error) {
                console.error(error)
            }
        }

        $('#saveItem').click(function() {
            const formData = getFormData('sku-create')
            save(formData)
        })
        $("#create-btn").click(function() {
            addCreateForm();
        })

        $("#datatable tbody").on('click', '.delete-btn', function() {
            let id = $(this).data('id');
            if (confirm("Are you sure you want to delete this SKU?")) {
                Delete(id);
            }
        })

        $(document).ready(() => {
            skuList()
        })
    })()
</script>