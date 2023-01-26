var connToken = "";
var db ="";
var rel = "";
var baseURL = "http://api.login2explore.com:5577";
var iml = "/api/iml";
var irl = "/api/irl";
var idl = "/api/idl";
var ping = "/jpdb/serverless/ping/v01";

/**
 * 
 * @param {string} base : Base URL 
 * @param {string} end : End-Point URL
 * @param {string} req : Request
 * @returns 
 **          if response string returned then returns javascript response object
 **          else undefined 
 */
function executeCommandAt(base, end, req){
    let url = base+end;
    let responseData;
    $.post(url, req, function(data,status){
        responseData = data;
    }).fail(function(data){
        responseData = data;
    });

    if((typeof responseData)==="object")
        return responseData;
    if(responseData!==undefined){
        return JSON.parse(responseData);
    }
}

/**
 * @description :[function to load footer]
 */
function loadFooter(){
    $("footer").load("resources/footer.html");
}

/**
 * @description :[function to initialize Page]
 */
function initPage(){
    
    if(checkError(getConnToken())){
        document.location.replace("index.html"); //If connToken absent then redirect to index page
        return "";
    }
    let token = getConnToken().split("|");
    connToken = getConnToken();
    $(page).addClass("active");
    $(page).attr("href","#");
    $("#currConn").html(token[0]+"| <br>"+token[1]+"| <br>"+token[2]);
    loadAllDatabase();
    return "success";
}

/**
 * @description :[function to load header]
 */
function loadHeader(){
    $("#myHeader").load("resources/header.html");
    $(document).ready(
        function (){
            if(checkError(initPage())){
                return "";
            }
            $(".relation").click(
                function (event){
                    relClickHandler(event);
                }
            );
        }
    );
}

/**
 * @description :[function to set Connection Token if exist and valid then redirect to Table page otherwise reload page]
 */
function setConnToken(){
    let token = $("#connId").val();
    let exist = validateConnToken(token);
    if(exist){
        localStorage.setItem("connToken", token);
        connToken = getConnToken();
        window.location.replace("Table.html")
    }
    else{
        alert("Connection Token Invalid !");
        window.location.reload();
    }
}

/**
 * 
 * @param {string} dbName :[Current Database Name]
 * @description :[Save Database to LocalStorage] 
 */
function setCurrentDB(dbName){
    localStorage.setItem("db", dbName);
}

/**

 * @returns {string}:[return Current Database Name] 
 */
function getCurrentDB(){
    return localStorage.getItem("db");
}

/**
 * 
 * @param {string} relName :[Current Relation Name]
 * @description :[Save Relation to LocalStorage] 
 */
function setCurrentRel(relName){
    localStorage.setItem("rel", relName);
}

/**
 * 
 * @returns {string} :[current relation name]
 */
function getCurrentRel(){
    return localStorage.getItem("rel");
}

/**
 * 
 * @returns {string} Connection Token
 */
function getConnToken(){
    return localStorage.getItem("connToken");
}

/**
 * 
 * @param {string} dbName : Name of Database to add in SideMenu 
 * @returns {string} Database template code
 */
function getDBTemplate(dbName){
    let dbTemplate = `<li class="nav-item" id="${dbName}"> <a href="#" class="nav-link"> <i class="nav-icon fas fa-table"></i> <p>${dbName}<i class="fas fa-angle-left right"></i> </p> </a><ul class="nav nav-treeview relation"></ul></li>`;
    return dbTemplate;   
}

/**
 * 
 * @param {string} relName : Name of relation
 * @param {string} dbName : Name of Database
 * @returns {string} String template
 */
function getRelTemplate(dbName,relName){
    let id = dbName+"_"+relName;
    let relTemplate = `<li class="nav-item" id="${id}"> <a href="#" class="nav-link relation"> <i class="far fa-circle nav-icon"></i> <p>${relName}</p> </a> </li>`;
    return relTemplate;
}

/**
 * @param {string} dbName : Name of Database whose relation to include
 * @returns {string} [request in json string] 
 */
function getRelRequest(dbName){
    let jsonStr = {
        "token": getConnToken(),
        "cmd": "GET_ALL_RELATIONS",
        "dbName": dbName
    }

    return JSON.stringify(jsonStr);
}

/**
 * 
 * @param {object} dbArr : Array object containing list of Database Name 
 * @description To add all database and relations to sidebar menu
 */
function addDBList(dbArr){
    let dbName = "";
    let relName = "";
    for(let i=0;i<dbArr.length;++i){
        dbName = dbArr[i];
        let dbTemplate = getDBTemplate(dbName);
        $("#dbContainer").append(dbTemplate);
        loadAllRelation(dbName);
        if(checkError(getCurrentDB()) || checkError(getCurrentRel())){
            db = dbName;
            $("#"+dbName).addClass("menu-open");
            let liTag = $("#"+dbName+" ul").children().eq(0);
            if(liTag.find("a").length==0){
                rel = "newRelation";
            }
            else{
                rel = liTag.find("p").text();
                liTag.find("a").addClass("active");
            }

            setCurrentDB(dbName);
            setCurrentRel(rel);
        }
    }
    db = getCurrentDB();
    rel = getCurrentRel();
    updatePage();
}

/**
 * @description :[function to load databases in sidemenu]
 */
function loadAllDatabase(){
    let jsonStr = {
        "token": getConnToken(),
        "cmd": "GET_ALL_DB" 
    }

    let req = JSON.stringify(jsonStr);

    $.ajaxSetup({async: false});
    let res = executeCommandAt(baseURL, irl, req);
    $.ajaxSetup({async: true});

    if(res.status==200){
        let dbArr = res.data; 
        addDBList(dbArr);
    }
}

/**
 * 
 * @param {string} dbName : Database Name 
 * @returns {string} [All relation template to load in side menu]
 */
function loadAllRelation(dbName){
    let req = getRelRequest(dbName);
    $.ajaxSetup({async: false});
    let res = executeCommandAt(baseURL, irl, req);
    $.ajaxSetup({async: true});

    if(res.status==200){
        let relTemplate = "";
        let relArr = res.data;
        let parId = "#"+dbName;
        for(let i=0;i<relArr.length;++i){
            let relName = relArr[i]["relName"];
            relTemplate = getRelTemplate(dbName, relName);
            $(parId+" ul").append(relTemplate);
        }
    }
}

/**
 * @description :[Update Current Page]
 */
function updatePage(){
    let id = "#"+db+"_"+rel+" a";

    if(db==="null" ||db==="undefined"){
        initPage();
    }
    $("#"+db).addClass("menu-open");
    $("#dbTitle").text(db);
    $("#relTitle").text(rel);
    $(id).addClass("active");
    $(".myTableHeader tr").empty();
    $(".myTableBody").empty();

    if(page==="#myTable"){
        updateTable();
    }
}

/**
 * 
 * @param {string|object} val 
 * @returns 
 * * true :[if value is error free(null,'null','undefined',undefined,'')]
 * * false :[if value has error value]
 */
function checkError(val){
    if(val==="null" || val==="undefined" || val===null || val===undefined || val==="")
        return true;
    
        return false;
}

/**
 * 
 * @param {object} event :[event object]  
 * @description :[handle click event on side-menu]
 */
function relClickHandler(event){
    if(checkError(getCurrentDB()) || checkError(getCurrentRel())){
        document.location.reload();
        return;
    }
    let preId = "#"+getCurrentDB()+"_"+getCurrentRel()+" a";
    //console.log(preId);
    $(preId).removeClass("active");
    $(preId).removeClass("menu-open");
    let id = event.target.parentElement.id;
    let idArr = id.replace("_"," ").split(" ");
    if(idArr[0]==="")
        return;
    setCurrentDB(idArr[0]);
    setCurrentRel(idArr[1]);
    db = idArr[0];
    rel = idArr[1];
    updatePage();
    if(page==="#myForm"){
        initFormPage();
    }
    
    if(page==="#myFilter"){
        dynamicFormGenerator();
    }
}

/**
 * 
 * @param {string} token :[connection token]
 * @returns 
 * * true :[if connection token valid]
 * * false:[otherwise]
 */
function validateConnToken(token){
    jsonStr = {
        "token": token
    }

    let req = JSON.stringify(jsonStr);

    $.ajaxSetup({async: false});
    let res = executeCommandAt(baseURL, ping, req);
    $.ajaxSetup({async: true});

    if(res.status==200){
        return true;
    }

    return false;
}

/**
 * @description :[update table]
 */
function updateTable(){
    let reqObj = {
        "token": connToken,
        "cmd": "GET_ALL",
        "dbName": db,
        "rel": rel,
        "pageNo": 1,
        "pageSize": 100,
    }

    let req = JSON.stringify(reqObj);
    $.ajaxSetup({async: false});
    let res = executeCommandAt(baseURL, irl, req);
    $.ajaxSetup({async: true});
    if(res.status==200){   
        let records = JSON.parse(res.data).json_records;
        let colHeader = getColHeader();
        makeTableHeader(colHeader);
        for(let i=0;i<records.length;++i){
            if(records[i].record!=null)
                makeTableRow(colHeader, records[i].record, records[i].rec_no);
        }
        $("table").attr("id","example1");
    }
    else{
        console.log("Error! while making table");
    }
}

/**
 * 
 * @returns 
 * * object :[Array containing column header names]
 * * "" :[when error occurs]
 */
function getColHeader(){
    let reqObj = {
        "token": connToken,
        "cmd": "GET_ALL_COL",
        "dbName": db,
        "rel": rel
    }

    let req = JSON.stringify(reqObj);

    $.ajaxSetup({async: false});
    let res = executeCommandAt(baseURL, irl, req);
    $.ajaxSetup({async: true});

    //console.log(res);
    if(res.status==200){
        let colHeader = [];
        let data = res.data;

        for(let i=0;i<data.length;++i){
            colHeader[i] = data[i].colName;
        }

        return colHeader;
    }
    else{
        document.location.reload();
        console.log("Error! while retrieving column header");
        return "";
    }
}

/**
 * 
 * @param {object} colHeader :[Column Header Array]
 * @description :[Make Table Header] 
 */
function makeTableHeader(colHeader){
    let par = ".myTableHeader tr";
    let cells = ""
    for(let i=0;i<colHeader.length;++i){
        cells = cells + "<th>"+colHeader[i]+"</th> ";
    }
    let lastCols = "<th>Edit</th> <th>Remove</th>";
    $(".myTableHeader tr").empty();
    $(".myTableBody").empty();
    $(par).append(cells+lastCols);
}

/**
 * 
 * @param {object} colHeader :[Array containing column header names]
 * @param {object} rowData :[json object containing data]
 * @param {string} id :[id for each row]
 * @description :[make table one row] 
 */
function makeTableRow(colHeader,rowData,id){
    let par = ".myTableBody";
    let cells = "<tr> "
    for(let i=0;i<colHeader.length;++i){
        cells = cells+"<td>"+rowData[colHeader[i]]+"</td> ";
    }

    let lastCols = "<td><a href='#' class='"+id+"' onClick='editLink(event)'><i class='fas fa-edit'></i></a></td>"+
                " <td><a href='#' class='"+id+"' onClick='removeLink(event)'><i class='fas fa-times'></i></a></td> </tr>";
    $(par).append(cells+lastCols);
}

/**
 * 
 * @param {object} event :[event object]
 * @description :[function to handle click event on edit link]
 */
function editLink(event){
    let rec_no = event.target.parentElement.className;
    localStorage.setItem("currRec", rec_no);
    document.location.replace("form.html");
}

/**
 * 
 * @param {object} event :[event object]
 * @description :[function to handle click event on remove link]
 */
function removeLink(event){
    let rec_no = event.target.parentElement.className;
    localStorage.setItem("currRec", rec_no);
    removeRecord();
    updatePage();
}

/**
 * @description :[function to remove record]
 */
function removeRecord(){
    let record = parseInt(localStorage.getItem("currRec"));
    let reqObj = {
        "token": connToken,
        "cmd": "REMOVE",
        "dbName": db,
        "rel": rel,
        "record": record
    }

    let req = JSON.stringify(reqObj);

    $.ajaxSetup({async: false});
    let res = executeCommandAt(baseURL, iml, req);
    $.ajaxSetup({async: true});

    if(res.status==200){
        localStorage.removeItem("currRec");
        console.log("removed !");
        document.location.reload();
    }
    else{
        console.log("Error! in removing record");
    }
}