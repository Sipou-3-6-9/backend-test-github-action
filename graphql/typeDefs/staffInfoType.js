


const staffInfoType = `#graphql
    # Query 
    type Query {
      getStaffInfoById(_id:ID!): StaffInfo
      getStaffInfoPagination(page:Int, limit:Int, keyword:String, pagination:Boolean, currentSituation:String): StaffInfoWithPaginator

    }
     # Mutation 
    type Mutation {
      createStaffInfo(input: StaffInfoInput): ResponseMessages
      updateStaffInfo(input: StaffInfoInput, _id:ID): ResponseMessages
      deleteStaffInfo(_id:ID): ResponseMessages
    }
    # Type
    type StaffInfo {
      _id: ID
      systemAccessData: SystemAccessData
      startedDate: Date
      currentSituation: String
      currentContract: Contract
      staffProfile: StaffProfile
      # otherInfo: OtherInfo
    
    }
    type SystemAccessData {
      emailAddress: String
      # password: String
      # accessPermissions: String
      role: String
      isActive: Boolean

    }
    type StaffProfile {
        imageName: String
        imageSrc: String
        englishData: EnglishData
        khmerData: KhmerData
    },
    type OtherInfo {
        educationBackground: [Education]
        drivingLicense: [DrivingLicense]
        covidVaccination: [CovidVaccination]
    }
    type EnglishData {
        firstNameLatin: String,
        lastNameLatin: String,
        gender: String
        identityCardEng: String,
        passportsNumerEng: String,
        phoneNumberEng: String,
        nationalityEng: String,
        dateOfBirthEng: Date,
        maritalStatusEng: String,
        placeOfBirthEng: PlaceEng,
        permananceAddressEng: PlaceEng,
        temporaryAddressEng: PlaceEng
    }
    type PlaceEng {
        villageEng: String,
        communeEng: String,
        districtEng: String,
        cityEng: String,
    }
    type KhmerData {
        firstNameKh: String,
        lastNameKh: String,
        placeOfBirthKh: PlaceKh
        permananceAddressKh: PlaceKh
        temporaryAddressKh: PlaceKh
    }
    type PlaceKh {
        villageKh: String,
        communeKh: String,
        districtKh: String,
        cityKh: String,
    }
    type ResponseMessages{
      success: Boolean
      message: String
    }
    type StaffInfoWithPaginator{
      paginator: Paginator
      data: [StaffInfo]
    }

    # Input
    input StaffInfoInput {
      systemAccessData: SystemAccessDataInput
      startedDate: Date
      currentSituation: String
      # currentContract: String
      staffProfile: StaffProfileInput
      # otherInfo: OtherInfoInput
    }
    input SystemAccessDataInput {
      emailAddress: String
      role: String
      isActive: Boolean
      # password: String
      # accessPermissions: String 
     
    }
    input StaffProfileInput {
      imageName: String
      imageSrc: String
      englishData: EnglishDataInput
      khmerData: KhmerDataInput
    }
    input EnglishDataInput {
      firstNameLatin: String,
      lastNameLatin: String,
      gender: String
      identityCardEng: String,
      passportsNumerEng: String,
      phoneNumberEng: String,
      nationalityEng: String,
      dateOfBirthEng: String,
      maritalStatusEng: String,
      placeOfBirthEng: PlaceEngInput,
      permananceAddressEng: PlaceEngInput,
      temporaryAddressEng: PlaceEngInput
    }
    input PlaceEngInput {
      villageEng: String,
      communeEng: String,
      districtEng: String,
      cityEng: String,
    }
    input KhmerDataInput {
      firstNameKh: String,
      lastNameKh: String,
      placeOfBirthKh: PlaceKhInput
      permananceAddressKh: PlaceKhInput
      temporaryAddressKh: PlaceKhInput
    }
    input PlaceKhInput {
      villageKh: String,
      communeKh: String,
      districtKh: String,
      cityKh: String,
    }


`;

export default staffInfoType