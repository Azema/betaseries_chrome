function trans(key, params, number) {
    if (typeof number === 'undefined') {
      number = null;
    } else if (number === 0) {
      number = 1;
    }
  
    var param;
    // t function is provided by Loco export
    // t function provides a plural management
    var message = t(key, null, number);
  
    for (param in params) {
        var r = new RegExp(param, 'g');
        
        if (r.test(message)) {
            var v = String(params[param]).replace(new RegExp('\\$', 'g'), '$$$$');
            message = message.replace(r, v);
        }
    }
    
    return message;
}
