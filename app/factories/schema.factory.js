//using mongoose to generate unique IDs for our schemas..
var mongoose = require('mongoose');

app.factory('SchemaFactory', function($rootScope, Storage) {
    
    var schemas;
    //Load schema or create new one
    function initializeSchemas(){
        if(Storage.isProjLoaded()){
            if(!Storage.get('schemas')) Storage.set('schemas',[]);
            schemas = Storage.get('schemas').map(sObj => convertPojoToSchema(sObj) ) || []; //root data structure
        }
    }
    //Schema constructor defintion 
    var Schema = function(name, id, fields){
        this.name = name || "";
        this.id = id ||  mongoose.Types.ObjectId().toString();
        this.fields = fields || [];
      }
       //Add field to a schema 
    Schema.prototype.addField = function(field){
        var edited = false;
        this.fields.forEach(function(onefield){
            if(onefield.name === field.name){
                onefield = field;
                edited = true;
            }
        })
        if(edited === false){
            this.fields.push(new Field(field.name,field.type,field.options,field.selectedArrType, field.selectedEmbed, field.reference));
        }
        edited = false;
            Storage.set('schemas', schemas);

    }
    //Delete field from a schema 
    Schema.prototype.deleteField = function(field){
        this.fields.splice(this.fields.indexOf(field), 1);
        Storage.set('schemas', schemas);
        $rootScope.$broadcast('newField', this.schemaId);
    }    
     //Schema field defintion 
    var Field = function(name, type, options, selectedArrType, selectedEmbed, reference){
        this.name = name || '';
        this.type = type || 'String';
        this.selectedArrType = selectedArrType || null;
        this.selectedEmbed = selectedEmbed || null;
        this.reference = reference || null;
        this.options = options || {select: true};
    }

    
    var convertPojoToSchema = function(sObj){
        return new Schema(sObj.name, sObj.id, sObj.fields.map(f => new Field(f.name, f.type, f.options, f.selectedArrType, f.selectedEmbed, f.reference)))
    }

    initializeSchemas();
    
        

    return {
        Schema: Schema,
        Field: Field,
        getSchemas: function() {
            return schemas;
        },
        addSchema: function(name){
            var newSchema = new Schema(name);
            schemas.push(newSchema);
            Storage.set('schemas', schemas);
            $rootScope.$broadcast('newSchema', newSchema.id);
            return newSchema;
        },
        deleteSchema: function(schema){
            schemas.splice(schemas.indexOf(schema), 1);
            Storage.set('schemas', schemas);
        },
        deleteAll: function(){
            schemas = [];
            Storage.set('schemas', schemas);
        },
        getSchemaById: function(id){
            return schemas.filter(schema => schema.id === id )[0];
        },
        exportSchemas : function(path){
            return new Promise(function(resolve, reject){
                index_file(schemas,path);
                save_schema(schemas,path);
                resolve({title: "Export Successful", text: "Schemas generated to "+ path, type: "success"});
            })
        },
        getSchemaByName: function(name){
            return schemas.filter(schema => schema.name === name )[0];
        },
        initialize: function(){
            initializeSchemas();
        }

    };

});

