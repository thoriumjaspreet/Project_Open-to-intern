const collegeModel = require('../models/collegeModel')
const validUrl = require('valid-url')
const { default: mongoose } = require('mongoose')
const internModel = require('../models/internModel')


function isValidRequestBody(requestBody){
    return Object.keys(requestBody).length > 0
}

function isValidLink(link){
    if (link.trim().match( /^(?:http(s)?:\/\/)?[\w.-]+(?:\.[\w\.-]+)+[\w\-\._~:/?#[\]@!\$&'\(\)\*\+,;=.]+$/ )){
        return true
    }
    return false
}
const createCollege = async function(req, res){

    try{
        const collegeDetails = req.body

        if( !isValidRequestBody(collegeDetails) ){
            return res.status(400).send({status: false, msg: "All fields are required"})
        }

        const {name, fullName, logoLink, } = collegeDetails

        if( !(name) ){
            return res.status(400).send({status: false, msg: "Name is required"})
        }
        
        if( !(fullName) ){
            return res.status(400).send({status: false, msg: "fullName is required"})
        }
        if( !(logoLink) ){
            return res.status(400).send({status: false, msg: "logoLink is required"})
        }

        if( !isValidLink(logoLink) ){
            return res.status(400).send({status: false, msg: "Not a link"})
        }
      if(!(name.trim().match(/^[a-zA-Z]+$/))){
        return res.status(400).send({status: false, msg: `${name} is INVALID name`})

      }
      if(!(fullName.trim().match(/^[a-zA-Z,\-.\s]*$/))){
        return res.status(400).send({status: false, msg: `${fullName} is INVALID name`})

      }



        // if( !isValid(isDeleted) ){
        //     req.body.isDeleted = false           //1
        // }

        // if( isDeleted === true || !isValid(isDeleted)  || typeof isDeleted === 'string' && isDeleted.trim().length > 0){
        //     req.body.isDeleted = false
        // }

        const isNamePresent = await collegeModel.findOne( { $or:[{name: name}, {fullName: fullName}, {logoLink: logoLink}] } )
        if(!isNamePresent){
            return res.status(400).send({status: false, msg: "College is already Present in DB."})
        }

        const collegeData = await collegeModel.create(collegeDetails)
        return res.status(201).send({status: true, data: collegeData})
    }
    catch (err){
        return res.status(500).send({status: false, msg: err.message})
    }

}

const getInterns = async function(req, res){
    try{
        const collegeName= req.query.collegeName

        if( !(collegeName) ){
            return res.status(400).send({status: false, msg: "please enter the college name"})
        }
        if( !( collegeName.trim().match(/^[a-zA-Z]+$/) ) ){
            return res.status(400).send({status: false, msg: `${collegeName} is INVALID collegeName.`})
        }

        const isCollegePresent = await collegeModel.findOne({name: collegeName})
        if(!isCollegePresent || (isCollegePresent.isDeleted === true)){
            return res.status(400).send({status: false, msg: "No college found"})
        }

        const collegeId = isCollegePresent._id.toString()
        if(!mongoose.isValidObjectId(collegeId)){
            return res.status(400).send({status: false, msg: "Not a valid id"})
        }
        
        const internData = await internModel.find({collegeId :collegeId}).select({name:1, mobile:1, email:1})
        
        const collegeDetails = await collegeModel.findOne({name: collegeName}).select({name:1, fullName:1, logoLink:1, _id:0})

        const internListWithCollege = collegeDetails.toJSON()
        internListWithCollege.interests = internData

        return res.status(200).send({status: true, data: internListWithCollege})


    }
    catch(err){
        return res.status(500).send({status: false, msg: err.message})
    }
}




module.exports = {createCollege,
    getInterns
}