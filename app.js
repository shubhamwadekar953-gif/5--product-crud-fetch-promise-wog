const cl = console.log;

const productForm = document.getElementById('productForm')
const userId = document.getElementById('userId')
const pName = document.getElementById('pName')
const imgUrl = document.getElementById('imgUrl')
const mrp = document.getElementById('mrp')
const submitBtn = document.getElementById('submitBtn')
const updateBtn = document.getElementById('updateBtn')
const productList = document.getElementById('productList')
const spinner = document.getElementById('spinner')

const BASE_URL = 'https://student-crud-26d0f-default-rtdb.firebaseio.com/5th%20product%20crud%20fetch%20promise%20wog';
const PRODUCT_URL = `${BASE_URL}products.json`

function snackbar(msg, icon){
    Swal.fire({ title: msg, icon: icon || 'success', timer: 2000, showConfirmButton: false })
}

function showSpinner(){ spinner?.classList.remove('d-none') }
function hideSpinner(){ spinner?.classList.add('d-none') }

const state = { productArr: [], editId: null }

// READ
function onCreateProduct(arr){
    let result = ``;
    arr.forEach(prod=>{
        result += `
            <tr id="${prod.id}">
                <td>${prod.userId}</td>
                <td>${prod.pName}</td>
                <td><img src="${prod.imgUrl}" alt="${prod.pName}" style="width:70px; height:70px; object-fit:cover; border-radius:6px;" onerror="this.src='https://via.placeholder.com/70'"></td>
                <td>${prod.mrp}</td>
                <td><i onclick="editProduct(this)" class="btn btn-warning">Edit</i></td>
                <td><i onclick="deleteProduct(this)" class="btn btn-danger">Remove</i></td>
            </tr>`
    })
    productList.innerHTML = result;
}

function fetchProduct(){
    showSpinner()
    fetch(PRODUCT_URL)
   .then(res => res.json())
   .then(data=>{
        if(data){
            for(const key in data){ data[key].id = key; state.productArr.unshift(data[key]) }
            onCreateProduct(state.productArr)
        }
    })
   .catch(err=> cl(err))
   .finally(()=> hideSpinner())
}
fetchProduct()

// CREATE
function onProductAdd(eve){
    eve.preventDefault()
    let productObj = {
        userId: userId.value.trim(),
        pName: pName.value.trim(),
        imgUrl: imgUrl.value.trim(),
        mrp: mrp.value.trim()
    }
    if(!productObj.userId ||!productObj.pName ||!productObj.imgUrl ||!productObj.mrp){
        return snackbar('Fill all fields','warning')
    }

    showSpinner()
    fetch(PRODUCT_URL, { method: "POST", body: JSON.stringify(productObj), headers: { "Content-type":"application/json" } })
   .then(res=> res.json())
   .then(data=>{
        productObj.id = data.name
        state.productArr.unshift(productObj)
        let tr = document.createElement('tr')
        tr.id = productObj.id
        tr.innerHTML = `
            <td>${productObj.userId}</td>
            <td>${productObj.pName}</td>
            <td><img src="${productObj.imgUrl}" alt="${productObj.pName}" style="width:70px; height:70px; object-fit:cover; border-radius:6px;" onerror="this.src='https://via.placeholder.com/70'"></td>
            <td>${productObj.mrp}</td>
            <td><i onclick="editProduct(this)" class="btn btn-warning">Edit</i></td>
            <td><i onclick="deleteProduct(this)" class="btn btn-danger">Remove</i></td>
        `
        productList.prepend(tr)
        productForm.reset()
        snackbar('Product added','success')
    })
   .catch(err=> cl(err))
   .finally(()=> hideSpinner())
}

// EDIT
function editProduct(ele){
    let editId = ele.closest('tr').id
    state.editId = editId
    let EDIT_URL = `${BASE_URL}products/${editId}.json`
    showSpinner()
    fetch(EDIT_URL)
   .then(res=> res.json())
   .then(data=>{
        userId.value = data.userId
        pName.value = data.pName
        imgUrl.value = data.imgUrl
        mrp.value = data.mrp
        submitBtn.classList.add('d-none')
        updateBtn.classList.remove('d-none')
    })
   .catch(err=> cl(err))
   .finally(()=> hideSpinner())
}

// UPDATE
function onUpdateProduct(){
    let update_Id = state.editId
    let UPDATE_URL = `${BASE_URL}products/${update_Id}.json`
    let updateObj = {
        userId: userId.value.trim(),
        pName: pName.value.trim(),
        imgUrl: imgUrl.value.trim(),
        mrp: mrp.value.trim(),
        id: update_Id
    }

    showSpinner()
    fetch(UPDATE_URL, { method: "PATCH", body: JSON.stringify(updateObj), headers: { "Content-type":"application/json" } })
   .then(()=>{
        let idx = state.productArr.findIndex(s=> s.id === update_Id)
        if(idx!== -1) state.productArr[idx] = updateObj
        let tr = document.getElementById(update_Id)
        tr.innerHTML = `
            <td>${updateObj.userId}</td>
            <td>${updateObj.pName}</td>
            <td><img src="${updateObj.imgUrl}" alt="${updateObj.pName}" style="width:70px; height:70px; object-fit:cover; border-radius:6px;" onerror="this.src='https://via.placeholder.com/70'"></td>
            <td>${updateObj.mrp}</td>
            <td><i onclick="editProduct(this)" class="btn btn-warning">Edit</i></td>
            <td><i onclick="deleteProduct(this)" class="btn btn-danger">Remove</i></td>
        `
        productForm.reset()
        submitBtn.classList.remove('d-none')
        updateBtn.classList.add('d-none')
        snackbar('Product Updated','success')
    })
   .catch(err=> cl(err))
   .finally(()=> hideSpinner())
}

// DELETE
function deleteProduct(ele){
    let REMOVE_ID = ele.closest('tr').id
    let REMOVE_URL = `${BASE_URL}products/${REMOVE_ID}.json`

    Swal.fire({
        title: "Are you sure?",
        text: "You won't be able to revert this!",
        icon: "warning",
        showCancelButton: true,
        confirmButtonColor: "#198754",
        cancelButtonColor: "#d33",
        confirmButtonText: "Yes, delete it!"
    }).then((result)=>{
        if(result.isConfirmed){
            showSpinner()
            fetch(REMOVE_URL, { method: "DELETE" })
           .then(res=>{
                if(!res.ok) throw new Error('Delete failed')
                return res.json()
            })
           .then(()=>{
                state.productArr = state.productArr.filter(s=> s.id!== REMOVE_ID)
                ele.closest('tr').remove()
                snackbar('Product Deleted','success')
            })
           .catch(err=>{ cl(err); snackbar('Failed','error') })
           .finally(()=> hideSpinner())
        }
    })
}

productForm?.addEventListener('submit', onProductAdd)
updateBtn?.addEventListener('click', onUpdateProduct)