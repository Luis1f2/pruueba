class User {
  constructor(id, nombre, edad, correo, contraseña, telefono) {
    this.id = id;
    this.nombre = nombre;
    this.año_nacimiento = edad;
    this.direccion_Email = correo;
    this.contraseña = contraseña;
    this.telefono = telefono;
  }
}

module.exports = User;
