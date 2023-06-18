
const documentType = `#graphql
type Query {
    getDocumentPagination(page:Int, limit:Int, keyword:String, pagination: Boolean, staffId: ID): DocumentPaginator
}
type Mutation {
    uploadStaffDocument(input: DocumentInput ): ResponseMessages
    renameDocument(_id: ID, documentName: String): ResponseMessages
    deleteDocument(_id:ID): ResponseMessages
    }
type Document {
    documentName: String,
    documentURL: String
    staffInfoId: StaffInfo
    createdAt: Date
    updatedAt: Date
}
type DocumentPaginator{
    data:[Document]
    paginator:Paginator
}
input DocumentInput{
    staffInfoId: ID!
    documentName: String,
    documentURL: String
}

`;
 
export default documentType