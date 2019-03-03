import {PetApi, Configuration, Pet, ApiException, Tag, HttpFile} from 'ts-petstore-client'
import { expect, assert } from "chai";
import * as fs from 'fs';

const configuration = new Configuration()
const petApi = new PetApi(configuration)

const tag = new Tag();
tag.name = "tag1"
tag.id = Math.floor(Math.random() * 100000)

const pet = new Pet()
pet.id = Math.floor(Math.random() * 100000)
pet.name = "PetName"
pet.photoUrls = []
pet.status = Pet.StatusEnum.Available
pet.tags = [ tag ]
pet.category = undefined

describe("PetApi", () =>{ 
    it("addPet", (done) => {
        petApi.addPet(pet).then(() => {
            return petApi.getPetById(pet.id)
        }).then((createdPet) => {
            expect(createdPet).to.deep.equal(pet);
            done()
        }).catch((err) => {
            done(err)
        })
    })

    it("deletePet", (done) => {
        petApi.addPet(pet).then(() => {
            return petApi.deletePet(pet.id)
        }).then(() => {
            return petApi.getPetById(pet.id)
        }).then((pet: Pet) => {
            done("Pet with id " + pet.id + " was not deleted!");
        }).catch((err: any) => {
            if (err.code && err.code == 404) {
                done();                
            } else {
                done(err)
            }
        })
    })

    it("findPetsByStatus", (done) => {
        petApi.addPet(pet).then(() => {
            return petApi.findPetsByStatus(["available"])
        }).then((pets: Pet[]) => {
            expect(pets.length).to.be.at.least(1);
            done();
        }).catch((err) => {
            done(err)
        })
    })

    // bugged on server side! Code 500
/*    it("findPetsByTag", (done) => {
        petApi.addPet(pet).then(() => {
            return petApi.findPetsByTags([tag.name])
        }).then((pets: Pet[]) => {
            expect(pets.length).to.be.at.least(1);
            done();
        }).catch((err) => {
            done(err);
        })
    })*/

    it("getPetById", (done) => {
        petApi.addPet(pet).then(() => {
            return petApi.getPetById(pet.id)
        }).then((returnedPet: Pet) => {
            expect(returnedPet).to.deep.equal(pet);
            done();
        }).catch((err) => {
            done(err);
        })
    })

    it("updatePet", (done) => {
        const oldName = pet.name
        const updatedName = "updated name";
        petApi.addPet(pet).then(() => {
            pet.name = updatedName
            return petApi.updatePet(pet).then(() => {
                pet.name = oldName;
            }).catch((err) => {
                pet.name = oldName
                throw err;
            });
        }).then(() => {
            return petApi.getPetById(pet.id);
        }).then((returnedPet: Pet) => {
            expect(returnedPet.id).to.equal(pet.id)
            expect(returnedPet.name).to.equal(updatedName);
            done();
        }).catch((err) => {
            done(err)
        })
    })

// not supported by online swagger api?
/*    it("updatePetWithForm", (done) => {
        const updatedName = "updated name";
        petApi.addPet(pet).then(() => {
            return petApi.updatePetWithForm(pet.id, updatedName)
        }).then(() => {
            return petApi.getPetById(pet.id)
        }).then((returnedPet: Pet) => {
            expect(returnedPet.id).to.equal(pet.id)
            expect(returnedPet.name).to.equal(updatedName);
            done()
        }).catch((err) => {
            done(err)
        })
    })*/

    it("uploadFile", (done) => {
        const image = fs.readFileSync(__dirname + "/pet.png")
        petApi.uploadFile(pet.id, "Metadata", { name: "pet.png", data: image}).then((response: any) => {
            expect(response.code).to.be.gte(200).and.lt(300);
            expect(response.message).to.contain("pet.png");
            done();
        }).catch((err) => {
            done(err);
        })
    })
})