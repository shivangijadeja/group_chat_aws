const send_button=document.querySelector('.send_btn')
const msg_input=document.querySelector('#message_box')
const msg_table=document.querySelector('.msg_table')
const user_list=document.querySelector('.user_list')
const create_group_form =document.querySelector('.create_group')
const list_of_groups=document.querySelector('.list_of_groups')
const edit_grp_btn=document.querySelector('.edit_grp_btn')

list_of_groups.addEventListener("click",onSelectGroup)

send_button.addEventListener("click",onSendMessage)

user_list.addEventListener("click",setUserChecked)

edit_grp_btn.addEventListener("click",editGroup)

create_group_form.addEventListener("submit",addGroup)

async function onSendMessage(e){
    const token = localStorage.getItem('token');
    const decoded = parseJwt(token);
    const input_val=msg_input.value
    const user_id=decoded.user_id
    const selected_grp=document.querySelector('#selected_grp_name').value
    let chatHis;
    if(selected_grp==='Common-chats'){
        chatHis={
            "message":input_val,
            "user_id":user_id
        }
        try{
            const post_msg=await axios.post('/post-common-meesage',chatHis)
        }
        catch(err){
            alert(err)
        }
    }
    else{
        chatHis={
            "message":input_val,
            "user_id":user_id,
            "group_name":selected_grp
        }
        try{
            const post_msg=await axios.post('/post-meesage',chatHis)
        }
        catch(err){
            alert(err)
        }
    }

}

async function addGroup(e){
    const token = localStorage.getItem('token');
    const decoded = parseJwt(token);
    const admin_user_id=decoded.user_id
    e.preventDefault();
    const group_name=document.querySelector('.grp_name').value;
    const selected_users=[]
    const users=Array.from(user_list.querySelectorAll('input'))
    users.forEach(element => {
        if(element.getAttribute('is_checked')==='true'){
            selected_users.push(element.getAttribute('id'))
        }
    });
    const grp={
        "name":group_name,
        "users":selected_users,
        "admin_id":admin_user_id
    }
    try{
        const add_group=await axios.post('/add-group',grp)
        alert("group created successfully")
    }
    catch(err){
        console.log(err)
    }
}

function parseJwt (token) {
    var base64Url = token.split('.')[1];
    var base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    var jsonPayload = decodeURIComponent(window.atob(base64).split('').map(function(c) {
        return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
    }).join(''));

    return JSON.parse(jsonPayload);
}

window.addEventListener("DOMContentLoaded" , async()=>{
    const selected_grp=document.querySelector('#selected_grp_name').value
    const token = localStorage.getItem('token');
    const fetch_all_msgs=await axios.get(`/get-all-messages`,{headers:{'Authorization':token}})
    display_messages(fetch_all_msgs.data.messages)
    try{
        const get_users=await axios.get('/user/all-users')
        if(get_users.data.users.length>0){
            for(let i=0;i<get_users.data.users.length;i++){
                const li=document.createElement('li')
                const check_box=document.createElement('INPUT')
                check_box.setAttribute("type", "checkbox")
                check_box.setAttribute("value", get_users.data.users[i].user_name)
                check_box.setAttribute("id", get_users.data.users[i].id)
                check_box.setAttribute("is_checked", false)
                const u_name=document.createTextNode(get_users.data.users[i].user_name)
                li.appendChild(check_box)
                li.appendChild(u_name)
                user_list.appendChild(li)
            }
        }
        const get_all_groups=await axios.get('/get-all-groups',{headers:{'Authorization':token}})
        display_groups(get_all_groups.data.groups)
    }
    catch(err){
        console.error(err)
    }
    
})

async function display_groups(arr_of_grps){
    const token = localStorage.getItem('token');
    const decoded = parseJwt(token);
    const admin_user_id=decoded.user_id
    arr_of_grps.forEach(element=>{
        const tr=document.createElement('tr')
        const td=document.createElement('li')
        td.className='list-group-item'
        var add_text=document.createTextNode(element.name)
        td.appendChild(add_text)
        const btn_edit=document.createElement('button')
        const btn_text=document.createTextNode("Edit")
        btn_edit.appendChild(btn_text)
        btn_edit.className='btn-sm btn-info btn_edit'
        if(admin_user_id===element.AdminId){
            td.appendChild(btn_edit)
        }
        tr.appendChild(td)
        list_of_groups.appendChild(tr)
    })
}

async function display_messages(arr_of_msgs){
    while (msg_table.firstChild) {
        msg_table.removeChild(msg_table.lastChild);
    }
    arr_of_msgs.forEach(element => {
        const tr=document.createElement('tr')
        const td=document.createElement('td')
        var add_text=document.createTextNode(element.name.concat("  :  ",element.message))
        td.appendChild(add_text)
        tr.appendChild(td)
        msg_table.appendChild(tr)
    });

}

function setUserChecked(e){
    const selected_ele=e.srcElement
    if(selected_ele.getAttribute('is_checked')==="false"){
        selected_ele.setAttribute('is_checked',true)
    }
    else{
        selected_ele.setAttribute('is_checked',false)
    }
    
}

async function onSelectGroup(e){
    const target=e.target.textContent
    
    const token = localStorage.getItem('token');
    if(target==="Edit"){
        document.querySelector('.create_grp_btn').classList='btn-sm create_grp_btn invisible'
        document.querySelector('.edit_grp_btn').classList='btn-sm edit_grp_btn'
        const edited_grp=e.target.previousSibling
        document.querySelector('.grp_name').value=edited_grp.textContent
        try{
            const fetch_details=await axios.get(`/get-group-details?name=${edited_grp.textContent}`)
            document.querySelector('.edit_grp_btn').setAttribute("edit_group_id",fetch_details.data.group.id)
            const users_id_list=fetch_details.data.members
            const u_list=document.querySelector('.user_list')
            var children = u_list.children;
            for (var i = 0; i <= children.length; i++) {
                var user = children[i];
                if(users_id_list.includes(Number(user.querySelector("input").getAttribute('id')))){
                    user.querySelector("input").setAttribute('is_checked',true)
                    user.querySelector("input").checked = true
                }
                else{
                    user.querySelector("input").setAttribute('is_checked',false)
                    user.querySelector("input").checked = false   
                }
            }
        }
        catch(err){
            console.log(err)
        }
    }
    else{
        while (msg_table.firstChild) {
            msg_table.removeChild(msg_table.lastChild);
        }
        var selected_grp=e.srcElement.innerText
        if(selected_grp.includes("Edit")){
            selected_grp=selected_grp.replace("Edit","")
        }
        document.querySelector('#selected_grp_name').value=selected_grp
        try{
            if(selected_grp==='Common-chats'){
                const fetch_all_msgs=await axios.get(`/get-all-messages`,{headers:{'Authorization':token}})
                display_messages(fetch_all_msgs.data.messages)
            }
            else{
                const fetch_grp_msgs=await axios.get(`/get-group-messages?group=${selected_grp}`)
                display_messages(fetch_grp_msgs.data.messages)
            }
            
        }
        catch(err){
            console.log(err)
        }
    }
}

async function editGroup(){
    const token = localStorage.getItem('token');
    const decoded = parseJwt(token);
    const admin_user_id=decoded.user_id
    const group_name=document.querySelector('.grp_name').value;
    const id=edit_grp_btn.getAttribute("edit_group_id")
    const selected_users=[]
    const users=Array.from(user_list.querySelectorAll('input'))
    users.forEach(element => {
        if(element.getAttribute('is_checked')==='true'){
            selected_users.push(element.getAttribute('id'))
        }
    });
    const grp={
        "name":group_name,
        "users":selected_users,
        "admin_id":admin_user_id
    }
    try{
        const edit_group=await axios.put(`/edit-group/${id}`,grp)
        alert("group updated successfully")
    }
    catch(err){
        console.log(err)
    }
}