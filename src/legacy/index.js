/* eslint-disable */
/** @ignore */

import { openDatabase } from 'database';
import * as logger from 'lib/logger';

let helper = {
    positiveSeconds(StartDate, EndDate){
        let seconds = (EndDate.getTime() - StartDate.getTime())/1000;
        if(seconds > 0){
            return seconds;
        }else{
            return 0;
        }
    },

    async retryCall(func,tries){
        const delay = ms => new Promise(resolve => setTimeout(resolve, ms));
        try{
            let retries = tries + 1;
            while(retries > 0){
                try{
                    return await func();
                }catch(err){
                    console.error('helper retryCall ', err);
                    logger.error('helper retryCall ', err);
                    await delay(500);
                    retries--;
                }
            }
            retries = 7; //backup if database is locked important for write functions
            while(retries > 0){
                try{
                    return await func();
                }catch(err){
                    console.error('helper retryCall backup', err);
                    logger.error('helper retryCall backup', err);
                    if(retries === 1){
                        throw(err);
                    }else{
                        await delay(10000);
                        retries--;
                    }
                }
            }
        }catch(err){
            throw(err);
        }
    },

};

let counter = {
    counter_object: {},
    check(type, id, date){
        if(this.counter_object[type]){
            let obj = this.counter_object[type];
            if(obj.id === id){ //only valid for matching id's
                let difference = (new Date() - obj.date) / 1000;
                return difference > 3600;
            }
        }
        this.counter_object[type] = {
            id: id,
            date: date
        };
        return false;
    }
};

export let batch = new function(){
    let standartDepth = 100;

    let wait = ms => new Promise(resolve => setTimeout(resolve, ms));

    this.docAggregation = async function(){
        logger.info('entering doc aggregation');

        try{
	        logger.silly('before loop');
            for(let i = 0; i < standartDepth; i++){
	            logger.silly(`loop iteration ${i}`);
                await wait(0);
                let stop = await doc(); // this file line 94
                if(stop){
                    break;
                }
            }
        }catch(err){
            logger.error('batch.eraseNull: ', JSON.stringify({batch_error: err}));
            throw(err);
        }

        async function doc(){
	        logger.silly(`function doc called. after this we crash`);

            let db = await openSQL(); // this file line 358

	        logger.silly(`loaded database - app usually crashes before this is being rendered`);

	        //  console.log(db);
            try{
                let row = await query(batchSQL.queryProgramLine);
                if(row === undefined || row === null){
                    return await closeDoc();
                }else{
                    const idProgram = row.idProgram;
                    const StartDate = new Date(row.StartDate); //?;
                    const EndDate = new Date(row.EndDate); //?;
                    const seconds = helper.positiveSeconds(StartDate,EndDate);
                    const ProgramName = row.ProgramName;
                    const Name = row.Name;
                    //exclude unalowed parameters
                    if(ProgramName === 'Finder' ||
                        ProgramName === 'Terminal' ||
                        ProgramName === 'explorer' || //added for windows
                        ProgramName === 'SearchUI' || //added for windows
                        ProgramName === 'OpenWith' || //added for windows
                        ProgramName === 'ShellExperienceHost' || //added for windows
                        Name === "ASStringEmpty" ||
                        Name === "") {
                        //Check if row is Finder and assinged to next document that is not Finder
	                    const rowDoc = await query(batchSQL.queryNextDoc(idProgram));
	                    if(rowDoc === undefined || rowDoc === null){
                            let deativate_row = counter.check('document', idProgram, EndDate);
                            if(deativate_row){
                                await updateDOC(-1, idProgram);
                                return await repeatDoc();
                            }else{
                                return await closeDoc();
                            }
                        }else{
                            logger.silly("next row ", rowDoc);
                            row = rowDoc;
                            //await makeInsert(rowDoc, seconds, idProgram);
                        }
                    }/*else{
                        await makeInsert(row, seconds, idProgram);
                    }*/
	                const DocumentPath = row.DocumentPath;
	                if(DocumentPath === "ASStringEmpty"){
	                    //get possible rows with valid path
		                const nextRows = await queryAll(batchSQL.queryNextDocPath(idProgram, row.ProgramName));
		                //ignore if no rows are found
		                if(nextRows.length > 0){
		                    //find the row closest to row if possible in the future
		                    let index = 0;
		                    for(let i = 0; i < nextRows.length; i++){
		                        let nextRow = nextRows[i];
		                        index = i;
		                        if(nextRow.idProgram > idProgram){
		                            //Exit if future row is found because it is the closest
		                            break;
                                }
                            }
                        }else{
			                //Program does not allow tracking propably
			                logger.warning(`Program does not allow tracking properly: ${ProgramName}`);
                        }
	                }
	                await makeInsert(row, seconds, idProgram);
	                return await repeatDoc();
                }
            }
            catch (err) {
	            logger.error(`batch.docAggregation: ${err.message || err}`);
	            throw(err);
            }

            async function closeDoc(){
                return new Promise((resolve, reject) => {
                    logger.info('closing doc aggregation');
                        resolve(true);
                });
            }

            async function repeatDoc(){
                return new Promise((resolve, reject) => {
                    logger.silly('close connection event repeat');
                        resolve(false);
                });
            }

            async function query(sql){
                return new Promise((resolve, reject) => {
                    db.serialize(function(){
                        db.get(sql, function(err, row){
                            if(err){
                                reject(err);
                            }else{
                                resolve(row);
                            }
                        });
                    });
                });
            }

	        async function queryAll(sql){
		        return new Promise((resolve, reject) => {
			        db.serialize(function(){
				        db.all(sql, function(err, rows){
					        if(err){
						        reject(err);
					        }else{
						        resolve(rows);
					        }
				        });
			        });
		        });
	        }

            async function updateDOC(updateID, updateIDProgram){
                return new Promise((resolve, reject) => {
                    let stmt = db.prepare(batchSQL.updateRowProgram);
                    stmt.run([updateID, updateIDProgram], function(err){
                        if(err){
                            reject(err);
                        }else{
                            resolve();
                        }
                    });
                    stmt.finalize();
                });
            }

            async function makeInsert(row,seconds,idProgram){
                let Name = row.Name;
                const ProgramName = row.ProgramName;
                const ProgramPath = row.ProgramPath;
                const DocumentPath = row.DocumentPath;
                //set name to filename if path has a valid filename
	            if(DocumentPath.includes('.')){
		            const path = nw.require('path');
		            Name = path.basename(DocumentPath);

	            }
                const Size = row.Size;
                const Day = row.StartDate.substring(0, 10);
                try{
                    //get line if exists
                    const row = await query(batchSQL.queryProcessedLine(Name || '',ProgramName || '',DocumentPath || '',Day)); //added '' for possible querry
                    let update_id = -1;
                    if(row === undefined || row === null){
                        //insert
                        update_id = await insert(Name, ProgramName, ProgramPath, DocumentPath, Size, seconds, Day);
                    }else{
                        //update
                        //If row exists and project active update time and Size
                        seconds += row.Time;//increment time
                        update_id = row.idProcessed;
                        await update(seconds, Size, row.idProcessed);
                    }
                    await updateDOC(update_id, idProgram);
                }catch(err){
                    throw(err);
                }

                async function insert(Name, ProgramName, ProgramPath, DocumentPath, Size, seconds, Day){
                    return new Promise((resolve, reject) => {
                        let stmt = db.prepare(batchSQL.insertRowProc);
                        stmt.run([Name, ProgramName, ProgramPath, DocumentPath, Size, seconds, Day], function(err){
                            if(err){
                                reject(err);
                            }else{
                                resolve(this.lastID);
                            }
                        });
                        stmt.finalize();
                    });
                }

                async function update(seconds, Size, idProcessed){
                    return new Promise((resolve, reject) => {
                        let stmt = db.prepare(batchSQL.updateRowProcessed);
                        stmt.run([seconds, Size, idProcessed], function(err){
                            if(err){
                                reject(err);
                            }else{
                                resolve();
                            }
                        });
                        stmt.finalize();
                    });
                }
            }
        }
    };
};
//---------------------------------------------------\\
//var obtaining all relevant SQLs for the batch #S001\\
//---------------------------------------------------\\
let batchSQL = new function(){

    this.queryProgramLine =
        "SELECT * FROM TProgram " +
        "WHERE idProcessed IS NULL " +
        "AND flagDocument IN (0,2) " +
        "AND EndDate IS NOT NULL";


    this.queryNextDoc = function(idProgram){
        return "SELECT * FROM TProgram " +
		"WHERE flagDocument IN (0,2) " +
		"AND idProgram > " + idProgram + " " +
		"AND ProgramName NOT IN ('Finder','Terminal','explorer', 'SearchUI', 'OpenWith', 'ShellExperienceHost') " + //win update do not use explorer etc.
		"AND Name != 'ASStringEmpty' " +
		"AND EndDate IS NOT NULL " +
		"LIMIT 1";
    };

	this.queryNextDocPath = function(idProgram, ProgramName){
		const query_ProgramName = ProgramName.replace(/'/g, "''");
		return `SELECT * FROM TProgram 
		        WHERE idProgram > ${idProgram - 10} 
		        AND ProgramName = '${query_ProgramName}' 
		        AND DocumentPath != 'ASStringEmpty' 
		        LIMIT 11`
    };

    this.queryProcessedLine = function(Name, ProgramName, DocumentPath, Day){
        const query_Name = Name.replace(/'/g, "''");
        const query_DocumentPath = DocumentPath.replace(/'/g, "''");
        const query_ProgramName = ProgramName.replace(/'/g, "''");
        return "SELECT idProcessed, Time, idSubProjectDay FROM TProcessedDay " +
            "WHERE Name ='" + query_Name + "' " +
            "AND ProgramName = '" + query_ProgramName + "' " +
            "AND DocumentPath = '" + query_DocumentPath + "' " +
            "AND Day = '" + Day + "' " +
            "AND idSubProjectDay IS NOT -1 " + //item not in trash
            "AND (idSubProjectDay IN (SELECT idSubProject FROM TSubProject WHERE ACTIVE = 1) " + //item is in active project
            "OR idSubProjectDay IS NULL) " + //or item has no project
            "AND active IS NULL";
    };

    //-------\\
    //UPDATES\\
    //-------\\
    this.updateRowProgram = "UPDATE TProgram " +
        "SET idProcessed = ? " +
        "WHERE idProgram = ?";



    this.updateRowProcessed = "UPDATE TProcessedDay " +
        "SET Time = ?, Size = ? " +
        "WHERE idProcessed = ?";


    //-------\\
    //INSERTS\\
    //-------\\
    this.insertRowProc = "INSERT INTO TProcessedDay " +
        "(Name, ProgramName, ProgramPath, DocumentPath, Size, Time, Day) " +
        "VALUES (?,?,?,?,?,?,?)";

};

async function openSQL (){
	logger.silly('usually this is not even printed');
    const db = await openDatabase();
    return db.driver;
}
