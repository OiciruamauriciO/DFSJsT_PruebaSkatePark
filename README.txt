No se quiso persistir los datos en la base de datos en la lógica de tiempo de ejecución, sin embargo, alimentando el json en tiempo de ejecución, se disponibiliza un endpoint 
para poder salvar los datos del json en la base de datos para aquellos id que no estén en ella, cuando el mismo se haya llamado. Como se consideró implementar paginación, la estrategia 
de trabajar en tiempo de sesión el json existente en el servidor, y solo salvarlo en el caso de que se llame al endpoint (por alguna regla de negocio que se puede imaginar, ya que la 
prueba no restringe eso específicamente), es buena (en consideración de que no hay sistema perfecto, sino que perfectible). Para este ejercicio se considera como valor clave en los procesos CRUD 
y de la bd skaters, el id y el correo. Los campos de actualizar en la vista de administrador, y de eliminar, en la misma vista, no se han implementado, ya que no es algo que se haya solicitado en la vista 
en la prueba, pero si se implementó en la vista aislada del perfil consultado. 

Saludos. 