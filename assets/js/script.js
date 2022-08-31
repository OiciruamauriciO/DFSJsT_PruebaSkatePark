const globalEmailValue = "";

async function actualizarPerfil(perfil){

    let data=[];
    let form = perfil.parentNode;
    let email = form[0].value;
    data.push(email);
    let nombre = form[1].value;
    data.push(nombre);
    let password = form[2].value;
    data.push(password);
    let repassword = form[3].value;
    data.push(repassword);
    let anos_experiencia = form[4].value;
    data.push(anos_experiencia);
    let especialidad = form[5].value;
    data.push(especialidad);

      const url = "/updateProfile";
   
      await axios.post(
        url,
        {},
        {
          params: {
            data
          }
        }
      )
      .then(response => {
        console.log(response);
      })
      .catch(error => {
        console.log(error);
      });
}

async function eliminarPerfil(perfil){
    let data=[];
    let form = perfil.parentNode;
    let email = form[0].value;
    data.push(email);
    let nombre = form[1].value;
    data.push(nombre);
    let password = form[2].value;
    data.push(password);
    let repassword = form[3].value;
    data.push(repassword);
    let anos_experiencia = form[4].value;
    data.push(anos_experiencia);
    let especialidad = form[5].value;
    data.push(especialidad);

      const url = "/deleteProfile";
   
      await axios.post(
        url,
        {},
        {
          params: {
            data
          }
        }
      )
      .then(response => {
        console.log(response);
      })
      .catch(error => {
        console.log(error);
      });
      
}

async function clickCheckBoxDetect(box){

  const url = "/updateState";
  const newState = box.checked;
  const idRef = box.id;

  console.log(box);

  if(box.checked==true){   
      await axios.post(
        url,
        {},
        {
          params: {
            newState,
            idRef
          }
        }
      )
      .then(response => {
        console.log(response);
      })
      .catch(error => {
        console.log(error);
      });
  }else{
    await axios.post(
      url,
      {},
      {
        params: {
          newState,
          idRef
        }
      }
    )
    .then(response => {
      console.log(response);
    })
    .catch(error => {
      console.log(error);
    });
  }
}