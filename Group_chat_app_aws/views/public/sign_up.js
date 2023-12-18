let my_form=document.querySelector('#sign_up_form');

my_form.addEventListener('submit',addUser);

async function addUser(e){
    e.preventDefault();
    let u_name=document.querySelector('.u_name').value
    let u_email=document.querySelector('.u_email').value
    let p_number=document.querySelector('.p_number').value
    let u_pwd=document.querySelector('.u_pwd').value
    let user_exist=false;

    let user={
        "user_name":u_name,
        "email":u_email,
        "phone_number":p_number,
        "password":u_pwd
    }

    const all_users=await axios.get('/user/all-users')
    if(all_users.data.users.length>0){
        for(let i=0;i<all_users.data.users.length;i++){
            if(all_users.data.users[i].email===u_email){
                user_exist=true
            }
        }
    }
    if(!user_exist){
        try{
            const add_user=await axios.post('/user/add-user',user)
            alert('Successfully signed up')
        }
        catch(err){
            console.error(err)
        }
    }
    else{
        alert("User already exists!, Please login")
    }
}