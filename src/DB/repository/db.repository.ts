import { DeleteResult, FlattenMaps, HydratedDocument, MongooseUpdateQueryOptions, PopulateOptions, ProjectionType, QueryOptions, RootFilterQuery, Types, UpdateQuery, UpdateWithAggregationPipeline, UpdateWriteOpResult } from "mongoose";
import { CreateOptions, Model } from "mongoose";

export type lean<T> = FlattenMaps<T>

export abstract class DatabaseRepository<TRowDocument ,  TDocument = HydratedDocument<TRowDocument>> {
  protected  constructor(protected model:Model<TDocument>){}

    
    async create({
        Data,
        options
    }: {
          
        Data: Partial<TRowDocument>[],
        options?: CreateOptions | undefined
    }): Promise<TDocument[] > {
          
        return await this.model.create(Data, options)|| []
    }
  
  
      async findOne<TLean extends boolean = false>({
          filter,
          select,
          options
      }: {
          filter?: RootFilterQuery<TRowDocument>,
          select?: ProjectionType<TRowDocument> | null
          options?: QueryOptions<TDocument> | null
      }): Promise<TLean extends true ? lean<TRowDocument> : TDocument | null> {
          
          const doc = this.model.findOne(filter).select(select || "")
          
          if (options?.populate) {
              doc.populate(options.populate as PopulateOptions[])
          }
  
          if (options?.lean) {
              doc.lean(options.lean)
          }
          
          return await doc.exec() as any
      }
      
      
      async find({
          filter,
          select,
          options
      }: {
          filter?: RootFilterQuery<TRowDocument>,
          select?: ProjectionType<TRowDocument> ,
          options?: QueryOptions<TDocument> | null
      }): Promise<TDocument[] | [] |lean<TDocument>[]> {
          
          const doc = this.model.find(filter||{}).select(select || "")
          
          if (options?.populate) {
              doc.populate(options.populate as PopulateOptions[])
          }
  
          if (options?.lean) {
              doc.lean(options.lean)
          }
          if (options?.limit) doc.limit(options.limit)
          if (options?.skip) doc.skip(options.skip)
              
          return await doc.exec()
      }
      async paginate({
          filter={},
          select={},
          options={},
          page = 1,
          size = 5
      }: {
          filter?: RootFilterQuery<TRowDocument>,
          select?: ProjectionType<TRowDocument> | undefined ,
          options?: QueryOptions<TDocument> | undefined,
          page?: number | 'all',
          size?:number
          }): Promise<{
              docsCount?:number,
              limit?: number,
              pages?:number,
              currentPage?: number|undefined,
              result:TDocument[]|lean<TDocument>[]
          }> {
          let docsCount : number|undefined = undefined
          let pages : number|undefined = undefined
        
          if (page != 'all') {
              page = Math.floor(!page || page < 1 ? 1 : page),   
              options.limit = Math.floor(size < 1 || !size ? 5 : size),
              options.skip= (page-1) * options.limit         
              docsCount = await this.model.countDocuments(filter)
              pages = Math.ceil(docsCount / options.limit)
           
          }
  
          
          const result = await this.find({filter ,select , options})
         
          return JSON.parse(JSON.stringify({ docsCount, limit: options.limit, pages, currentPage: page, result }))
      }
  
      async updateOne({ filter, update, options }: {
          
          filter: RootFilterQuery<TRowDocument>;
          update: UpdateQuery<TDocument> | UpdateWithAggregationPipeline;
          options?: MongooseUpdateQueryOptions<TDocument> | null
      }): Promise<UpdateWriteOpResult> {
         
        if (Array.isArray(update)) {
            update.push({ $set: { __v: { $add: ['$__v', 1] } }}) 
         return await this.model.updateOne(filter || {}, update , options)
         }
        
         
          return await this.model.updateOne(filter || {}, {
              $inc: { __v: 1 },
              ...update
          }, options)
      }
      
      async updateMany({ filter, update, options }: {
          
          filter: RootFilterQuery<TRowDocument>;
          update: UpdateQuery<TDocument> | UpdateWithAggregationPipeline;
          options?: MongooseUpdateQueryOptions<TDocument> | null
      }): Promise<UpdateWriteOpResult> {
         
          if (Array.isArray(update)) {
              
          return await this.model.updateMany(filter || {}, update , options||{})
          }
         
          return await this.model.updateMany(filter || {}, {
              ...update,
              $inc: { __v: 1 }
          }, options)
      }
      
      async findById({
          id
      }: {
          
          id: string | Types.ObjectId
             
      }): Promise<lean<TDocument> | TDocument | null> {
          
          return await this.model.findById(id)
      }
  
           
  
      
      async findByIdAndUpdata({ id, update, options = { new: true } }: {
  
          id: Types.ObjectId;
          update: UpdateQuery<TDocument> | UpdateWithAggregationPipeline;
          options?: QueryOptions<TDocument> | null
      }): Promise<TDocument | lean<TDocument> | null> {
          return this.model.findByIdAndUpdate(id, {
              ...update,
              $inc: { __v: 1 }
          }, options)
      }
      async findOneAndUpdate({ filter, update, options = { new: true } }: {
  
          filter: RootFilterQuery<TRowDocument>
          update: UpdateQuery<TDocument> | UpdateWithAggregationPipeline;
          options?: QueryOptions<TDocument> | null
      }): Promise<TDocument | lean<TDocument> | null> {
       
          if (Array.isArray(update)) {
           update.push({ $set: { __v: { $add: ['$__v', 1] } }}) 
        return await this.model.findOneAndUpdate(filter || {}, update , options)
        }
       
          
          return this.model.findOneAndUpdate(
              filter,
             { ...update,
              $inc: { __v: 1 }
          }, options)
      }
  
      async findOneAndDelete({ filter }: {
  
          filter: RootFilterQuery<TRowDocument>
      }): Promise<TDocument | lean<TDocument> | null> {
          return this.model.findOneAndDelete(filter )
      }
  
  
  
  
  
  
      async deleteOne({ filter }: {
          
          filter: RootFilterQuery<TRowDocument>;
      }):Promise<DeleteResult> {
          return await this.model.deleteOne(filter)
      
      }
      async deleteMany({ filter }: {
          
          filter: RootFilterQuery<TRowDocument>;
      }):Promise<DeleteResult> {
          return await this.model.deleteMany(filter)
      
      }
  }

