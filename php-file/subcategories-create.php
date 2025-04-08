<form id="subcategories-create">
    <div class="row">
        <div class="col-sm-10">
            <label>Name</label>
            <input type="text" class="form-control" name="Name">
        </div>
        <div class="col-sm-10">
            <label for="">Categories</label>
            <select name="CategoryId" class="form-control" id="CategoryId"></select>
        </div>
    </div>
</form>

<script>
    (function() {
        const makeDropdown = (data, id) => {
            let html = '';
            data?.data?.forEach(item => {
                html += `<option value="${item.Id}">${item.Name}</option>`
            });

            $(id).html(html);
        }
        const getCategories = async () => {
            try {
                const response = await getAjax(`${baseUrl}categories/get`);
                makeDropdown(response, "#CategoryId");
            } catch (error) {
                console.error(error);
            }
        }
        $(document).ready(function() {
            getCategories();
        })
    })()
</script>