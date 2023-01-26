var connToken = getConnToken();
var db = getCurrentDB();
var rel = getCurrentRel();
var colHeader = getColHeader();

/**
 * 
 * @returns :[Checks if record exist then returns table data(json object) otherwise ""]
 */
function isRecordExist(){
    let rec = getCurrRec();

    let req = createGET_BY_RECORDRequest(connToken, db, rel, rec, true, true);

    $.ajaxSetup({async: false});
    let res = executeCommandAt(baseURL, irl, req);
    $.ajaxSetup({async: true});

    if(res.status==200){
        return JSON.parse(res.data).record;
    }
    else{
        //console.log("Record not exist");
        return "";
    }
}

function setFirstRec(rec){
    localStorage.setItem("firstRec", rec);
}

function setLastRec(rec){
    localStorage.setItem("lastRec", rec);
}

function setCurrRec(rec){
    localStorage.setItem("currRec",rec);
}

function getFirstRec(){
    return localStorage.getItem("firstRec");
}

function getLastRec(){
    return localStorage.getItem("lastRec");
}

function getCurrRec(){
    return localStorage.getItem("currRec");
}

/**
 * @description :[initialize form]
 */
function initForm(){
    localStorage.removeItem("firstRec");
    if(isRecordExist(getCurrRec())==="")
        localStorage.removeItem("currRec");
    localStorage.removeItem("lastRec");
}

/**
 * @description :[set first record]
 */
function setFirst(){
    let req = createFIRST_RECORDRequest(connToken, db, rel);

    jQuery.ajaxSetup({async: false});
    let response = executeCommandAt(baseURL, irl, req);
    jQuery.ajaxSetup({asysn: true});

    if(response.status===200){
        let data = JSON.parse(response.data);
        setFirstRec(data.rec_no);
    }
    else{
       // console.log("Error first rec !");
    }
}

/**
 * @description :[set last record]
 */
function setLast(){
    let req = createLAST_RECORDRequest(connToken, db, rel, getCurrRec());

    jQuery.ajaxSetup({async: false});
    let response = executeCommandAt(baseURL, irl, req);
    jQuery.ajaxSetup({asysn: true});

    if(response.status==200){
        let data = JSON.parse(response.data);
        setLastRec(data.rec_no);
    }
    else{
        //console.log("Error in last rec !");
    }
}

/**
 * @description :[set next record as current record]
 */
function setNext(){
    let req = createNEXT_RECORDRequest(connToken, db, rel, getCurrRec());

    jQuery.ajaxSetup({async: false});
    let response = executeCommandAt(baseURL, irl, req);
    jQuery.ajaxSetup({asysn: true});

    if(response.status==200){
        let data = JSON.parse(response.data);
        setCurrRec(data.rec_no);
    }
    else{
       // console.log("No next data !");
    }
}

/**
 * @description :[set previous record as current record]
 */
function setPrev(){
    let req = createPREV_RECORDRequest(connToken, db, rel, getCurrRec());

    jQuery.ajaxSetup({async: false});
    let response = executeCommandAt(baseURL, irl, req);
    jQuery.ajaxSetup({asysn: true});

    if(response.status==200){
        let data = JSON.parse(response.data);
        setCurrRec(data.rec_no);
    }
    else{
       // console.log("Error prev data !");
    }
}

/**
 * @description :[check for initial(existing) record number]
 */
function check0(){
    disableButton(true);
    disableInput(true);
    disableNav(true);
    if(getLastRec()===null){
        $("#remove").prop("disabled", true);
        $("#new").prop("disabled", false);
        return ;
    }
    else{
        resetData();
    }
}

//functions to disable input, button and navigation button
function disableInput(off){
  $(".myInput").prop("disabled", off);
}

function disableButton(off){
    $("#new").prop("disabled", off);
    $("#save").prop("disabled", off);
    $("#edit").prop("disabled", off);
    $("#change").prop("disabled", off);
    $("#reset").prop("disabled", off);
}

function disableNav(off){
    $("#first").prop("disabled", off);
    $("#prev").prop("disabled", off);
    $("#next").prop("disabled", off);
    $("#last").prop("disabled", off);
}

/**
 * 
 * @param {string} name :[Convert field name into id by replacing " " -> "" ] 
 */
function getId(name){
    return name.replace(" ","");
}

/**
 * 
 * @param {string} name : [Column name in table]
 * @param {string|number} index: [index of colHeader]
 * @returns {string} :[template for input field]
 */
function getInputFieldTemplate(name, index){
    let template = '<div class="form-group"> '+ 
                    '<label>'+name+'</label>'+
                    '<input type="text" class="form-control myInput" id="input'+index+'">'+
                    '</div>';
    return template;
}

/**
 * 
 * @returns {string} :[navigation form control template]
 */
function getNavigationTemplate(){
    let template = `<div class="form-row" style="margin-top: 10px; margin-bottom: 10px;">
    <div class="col">  
      <button type="button" class="btn btn-primary form-control" id="new" onclick="newData()">New</button>
    </div>
    <div class="col">
      <button type="button" class="btn btn-primary form-control" id="save" onclick="saveData()">Save</button>
    </div>
    <div class="col">
      <button type="button" class="btn btn-primary form-control" id="edit" onclick="editData()">Edit</button>
    </div>
    <div class="col">
      <button type="button" class="btn btn-primary form-control" id="change" onclick="changeData()">Change</button>
    </div>
    <div class="col">
      <button type="button" class="btn btn-primary form-control" id="reset" onclick="resetData()">Reset</button>
    </div>
    <div class="col">
      <button type="button" class="btn btn-primary form-control" id="remove" onclick="removeRecord()">Remove</button>
    </div>
</div>
<div class="form-row" style="margin-top: 10px; margin-bottom: 10px;">
    <div class="col">
      <button class="btn btn-primary form-control" id="first" onclick="getFirst()">First</button>
    </div>
    <div class="col">
      <button class="btn btn-primary form-control" id="prev" onclick="getPrev()">Previous</button>
    </div>
    <div class="col">
      <button class="btn btn-primary form-control" id="next" onclick="getNext()">Next</button>
    </div>
    <div class="col">
      <button class="btn btn-primary form-control" id="last" onclick="getLast()">Last</button>
    </div>
</div>`;

    return template;
}

/**
 * @description :[Creates dynamic form as per column header]
 * * By default first colHeader index('0') is primary key 
 */
function dynamicFormGenerator(){
    $(".card-body form").empty();

    colHeader = getColHeader();

    for(let i=0;i<colHeader.length;++i){
        $(".card-body form").append(getInputFieldTemplate(colHeader[i],i));
    }

    if(page!=="#myFilter")
        $(".card-body form").append(getNavigationTemplate());
    
    if(page==="#myFilter"){
        let template = `<div class="form-row" style="margin-top: 10px; margin-bottom: 10px;">
                    <div class="col">
                    <button class="btn btn-primary form-control" id="first">Add</button>
                    </div>`;
        $(".card-body form").append(template);
    }
}

/**
 * @description :[validate form data]
 * @returns {object|string}
 * *  object :[if form data is valid]
 * *  "" :[if form data is invalid]
 */
function validateData(){
    const json = {};

    for(let i=0;i<colHeader.length;++i){
        json[colHeader[i]] = $("#input"+i).val();
        if(json[colHeader[i]]===""){
            alert("Enter "+colHeader[i]+" !");
            $("#input"+i).focus();
            return "";
        }
    }
     return json;
}

/**
 * @description :[reset form data]
 */
function resetData(){
    if(isRecordExist()==="" && getLastRec()!==null){
        localStorage.setItem("currRec", getLastRec());
    }
    if(getCurrRec()===null){
        disableButton(true);
        disableInput(true);
        disableNav(true);
        $("#remove").prop("disabled", true);
        $("#new").prop("disabled", false);
        console.log("No data !");
    }
    else {
        $("#remove").prop("disabled", false);
        fillData("");
    }
}

/**
 * @description :[method invoked when primary key column field changes to check for existing data]
 */
function getDetail(){

    let data = isRecordExist();

    if(data!==""){
        localStorage.setItem("currRec", data.rec_no);
        fillData(data);
    }
}

/**
 * 
 * @param {object} data {optional}:[containing data]
 * @description :[if data not present then current record data filled]
 */
function fillData(data){

    if(data===""){
        let req = createGET_BY_RECORDRequest(connToken, db, rel, getCurrRec());
    
        jQuery.ajaxSetup({async: false});
        let response  = executeCommandAt(baseURL, irl, req);
        jQuery.ajaxSetup({async: true});

        if(response.status==200){
            let data = JSON.parse(response.data);
            let record = data.record

            for(let i=0;i<colHeader.length;++i){
                $("#input"+i).val(record[colHeader[i]]);
            }

            disableInput(true);
            disableNav(true);
            disableButton(true);

            $("#new").prop("disabled", false);
            $("#edit").prop("disabled", false);

            navSetting();
        }
        else{
            disableButton(true);
            disableInput(true);
            disableNav(true);
            $("#new").prop("disabled", false);
        } 
    }
    else{
        for(let i=0;i<colHeader.length;++i){
            $("#input"+i).val(data[colHeader[i]]);
        }

        disableInput(true);
        disableNav(true);
        disableButton(true);

        $("#new").prop("disabled", false);
        $("#edit").prop("disabled", false);

        navSetting();
    }
}

/**
 * @description :[for setting navigation button disability]
 */
function navSetting(){
    if(getLastRec()!==getFirstRec()){
        if(getCurrRec()===getFirstRec()){
            $("#next").prop("disabled", false);
            $("#last").prop("disabled", false);
        }
        else if(getCurrRec()===getLastRec()){
            $("#first").prop("disabled", false);
            $("#prev").prop("disabled", false);
        }
        else{
            disableNav(false);
        }
    }
}

/**
 * @description :[To reset value of all the fields of form]
 */
function newData(){
    for(let i=0;i<colHeader.length;++i){
        $("#input"+i).val("");
    }
    
    disableButton(true);
    disableInput(false);
    disableNav(true);

    $("#save").prop("disabled", false);
    $("#reset").prop("disabled", false);
}

/**
 * @description :[invoked when edit button clicked]
 */
function editData(){
    disableInput(false);
    disableButton(true);
    disableNav(true);

    $("#input0").prop("disabled", true);
    
    $("#change").prop("disabled", false);
    $("#reset").prop("disabled", false);
}

/**
 * @description :[invoked when save button clicked]
 */
function saveData(){
    let json = validateData();

    if(json==="")
        return ;

    jsonStr = JSON.stringify(json);

    let req = createPUTRequest(connToken, jsonStr, db, rel);

    jQuery.ajaxSetup({async: false});
    let response = executeCommandAt(baseURL, iml, req);
    jQuery.ajaxSetup({async: true});

    if(response.status==200){
        let data = JSON.parse(response.data);
        if(getFirstRec()==null){
            setFirstRec(data.rec_no);
        }
        setCurrRec(data.rec_no);
        setLastRec(data.rec_no);
        resetData();
    }
    else{
        console.log(response.status);
        alert("Error !");
    }
}

/**
 * @description :[invoked when change button clicked]
 */
function changeData(){
    let json = validateData();

    if(json==="")
        return ;

    jsonStr = JSON.stringify(json);

    let req = createUPDATERecordRequest(connToken, jsonStr, db, rel, getCurrRec());

    jQuery.ajaxSetup({async: false});
    executeCommandAt(baseURL, iml, req);
    jQuery.ajaxSetup({async: true});

    resetData();
}

/**
 * @description :[invoked when remove button clicked]
 */
function removeRel(){
    let jsonStr = {
        "token": connToken,
        "cmd": "REMOVE_RELATION",
        "dbName": db,
        "rel": rel
    }
    
    let req = JSON.stringify(jsonStr);

    $.ajaxSetup({async: false});
    let res = executeCommandAt(baseURL, idl, req);
    $.ajaxSetup({async: true});

    if(res.status==200){
        alert("Relation Deleted !");
        window.location.replace("Table");
    }
    else{
        console.log("Error! in deleting relation");
    }
}

function getFirst(){
    setCurrRec(getFirstRec());
    fillData("");
}

function getLast(){
    setCurrRec(getLastRec());
    fillData("");
}

function getNext(){
    setNext();
    fillData("");
}

function getPrev(){
    setPrev();
    fillData("");
}

/**
 * @description :[To initialize form page]
 */
function initFormPage(){
        dynamicFormGenerator();
        initForm();
        setFirst();
        setLast();
        check0();
        resetData();
}

/**
 * @description :[invoked when page get loaded]
 */
$(document).ready(
    function (){
        if(page==="#myForm")
            initFormPage();
        if(page==="#myFilter"){
             dynamicFormGenerator();
         }
    }
);