// loads file text
// uses code from Appendix F of Matsuda & Lea

// load text from a file, and calls 'load_handle(file_string)' when done
async function loadFile(file_name) {
  return new Promise((resolve, reject) => {
    var request = new XMLHttpRequest();
    request.onreadystatechange = function() {
        if (request.readyState === 4 & request.status != 404)
            resolve(request.responseText);
    }
    request.open('GET', file_name, true);
    request.send();
  })

}
