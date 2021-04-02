const AclActions = require('../model/Action');
const AclPermissions = require('../model/Permissions')

module.exports ={

    setAclPermissions: async function (req, res) {
        try {
            let { role, controller, permissions = [] } = req.body //role , controller, permissions for actions IDs
            try {
                let data = []
                console.log(role, controller, permissions)
                if (controller === 'all') {
                    let allControllers = await AclActions.find().distinct('controller')
                    allControllers.forEach(async (controller1) => {
                        let actions = await AclActions.find({ controller: controller1 })
                        let allPermissions = actions.map(a => a._id.toString());
                        let alreadyExists = await AclPermissions.find({ role: role, controller: controller1 })
                        if (!alreadyExists.length) {
                            data = await AclPermissions.create({ role: role, controller: controller1, permissions: allPermissions })
                        } else {
                            data = await AclPermissions.updateOne({ role: role, controller: controller1 }, { permissions: allPermissions });
                        }
                    })
                    Util.sendCustomResult(req, res, 'SUCCESS', 'ACL_PERMISSION_UPDATED', data);
                } else {
                    let alreadyExists = await AclPermissions.find({ role: role, controller: controller })
                    if (!alreadyExists.length) {
                        data = await AclPermissions.create({ role: role, controller: controller, permissions })
                    } else {
                        data = await AclPermissions.updateOne({ role: role, controller: controller }, { permissions });
                    }
                    Util.sendCustomResult(req, res, 'SUCCESS', 'ACL_PERMISSION_UPDATED', data);
                }
            } catch (error) {
                console.log('error', error);
                Util.sendCustomResult(req, res, 'SERVER_ERROR', 'ACL_PERMISSION_NOT_CREATED');
            }
        } catch (error) {
            console.error(error)
            Util.sendCustomResult(req, res, 'SERVER_ERROR', 'ACL_PERMISSION_NOT_CREATED');
        }

    },
    getAclPermissions: async function (req, res) {
        try {
            const roles = config.roles //await Roles.find({})
            const controllers = await AclActions.find().distinct('controller')
            let data = {}
            Object.assign(data, { roles: Object.values(roles) })
            Object.assign(data, { constrollers: controllers })
            return Util.sendCustomResult(req, res, 'SUCCESS', 'ACL_PERMISSIONS_FOUND_SUCCESSFULLY', data);
            // exits.success({roles,controllers})
        } catch (error) {
            console.error(error)
            Util.sendCustomResult(req, res, 'SERVER_ERROR', 'ACL_PERMISSION_NOT_FOUND');
        }

    },
    getAclActions: async function (req, res) {
        try {
            let result;
            let controller = req.query.controller;
            let role = req.query.role;
            if (controller === 'all') {
                result = await AclActions.find({})
                const aclPermissions = await AclPermissions.find({ role })
                if (aclPermissions !== undefined && aclPermissions.length) {
                    aclPermissions.forEach(aclPermission => {
                        const { permissions } = aclPermission
                        result.map(action => {
                            if (permissions.indexOf(action._id) > -1) {
                                action.hasAccess = true
                            }
                            return action
                        })
                    })
                }
            } else {
                result = await AclActions.find({ controller })
                const aclPermissions = await AclPermissions.find({ controller, role })
                if (aclPermissions !== undefined && aclPermissions.length) {
                    const [{ permissions }] = aclPermissions
                    result.map(action => {
                        if (permissions.indexOf(action._id) > -1) {
                            action.hasAccess = true
                        }
                        return action
                    })
                }
            }
            const data = { result }
            return Util.sendCustomResult(req, res, 'SUCCESS', 'ROLE_BASED_ACL_ACTIONS_FOUND_SUCCESSFULLY', data)
        } catch (error) {
            console.error(error)
            Util.sendCustomResult(req, res, 'SERVER_ERROR', 'ROLE_BASED_ACL_ACTIONS_NOT_FOUND');
        }

    },
    viewAclActions: async function (req, res) { //{page},exits
        try {
            var sortBy = { 'createdAt': 'desc' }
            var options = {
                sort: sortBy
            }
            var conditions = {}            //role:config.roles.USER
            if (req.query.page != undefined && parseInt(req.query.page)) {
                options.page = req.query.page;
            }
            if (req.query.limit != undefined && parseInt(req.query.limit)) {
                options.limit = req.query.limit;
            }

            if (req.query.role && req.query.role != undefined) {
                Object.assign(conditions, { role: req.query.role })
            }

            if (req.query.search != undefined && req.query.search.length > 0) {
                conditions.$and =
                    [
                        {
                            $or: [
                                {
                                    'controller': { $regex: '.*' + req.query.search.trim() + '.*', '$options': 'i' }
                                },
                                {
                                    'action': { $regex: '.*' + req.query.search.trim() + '.*', '$options': 'i' }
                                }
                            ]
                        }
                    ]

            }

            if (req.query.sort != undefined && req.query.sort.length > 0) {
                options.sort = {}
                options.sort[req.query.sort] = req.query.order
            }

            if (options.limit) {
                var total1 = await AclActions.paginate(conditions, options);
                Util.sendCustomResult(req, res, 'SUCCESS', 'ACL_ACTIONS_FOUND_SUCCESSFULLY', Util.paginateData(total1));
            } else {
                var total2 = await AclActions.find(conditions).sort(sortBy);
                Util.sendCustomResult(req, res, 'SUCCESS', 'ACL_ACTIONS_FOUND_SUCCESSFULLY', total2);
            }
        } catch (error) {
            console.error(error)
            Util.sendCustomResult(req, res, 'SERVER_ERROR', 'ACL_ACTIONS_NOT_FOUND');
        }

    },
    // updateAclActions: async function (req, res) {
    //     // Add ROUTER, ROUTER_LIST and ROUTER_PATH each time you add a new router file.
    //     // ROUTELIST will define the "controller_name + Routes" , so make sure to have unique controller_name.
    //     // Both  ROUTERS, ROUTER_LIST should be same and in sequence with same indexes.
    //     // RoutesPath defines the route used in swaggers.
    //     let Routers = [usersRoutes, authRoutes, billBoardsRoutes, fairsRoutes,locationsRoutes, appointmentsRoutes ,categoriesRoutes, countriesRoutes, notificationsRoutes , ordersRoutes, testimonialsRoutes , buyerDiscountsRoutes, discountsRoutes, paymentDetailsRoutes, stallsRoutes, productCategoriesRoutes,productDescriptionsRoutes, productsRoutes, paymentsRoutes, briefcaseRoutes, cartsRoutes]
    //     let RoutesList = ['usersRoutes', 'authRoutes', 'billBoardsRoutes', 'fairsRoutes','locationsRoutes', 'appointmentsRoutes', 'categoriesRoutes', 'countriesRoutes', 'notificationsRoutes' , 'ordersRoutes', 'testimonialsRoutes' , 'buyerDiscountsRoutes', 'discountsRoutes', 'paymentDetailsRoutes', 'stallsRoutes', 'productCategoriesRoutes','productDescriptionsRoutes', 'productsRoutes', 'paymentsRoutes' , 'briefcaseRoutes', 'cartsRoutes'] //Controllers
    //     let RoutesPath = ['users', '', 'admin/billboards', 'admin/fairs', 'admin/locations','appointments', 'categories', 'countries', 'notifications' , 'orders', 'testimonials' , 'vendor/buyerDiscounts', 'vendor/discounts', 'vendor/paymentDetails', 'vendor/stalls' ,'productCategories','productDescriptions', 'vendor/products', 'payments', 'buyer/briefcase', 'buyer/carts'] //Path
    //     let routes = []
    //     Routers.forEach((router) => {
    //         if (router.stack) {
    //             router.stack.forEach(function (r) {
    //                 if (r.route && r.route.path) {
    //                     r.route.controller = RoutesList[Routers.indexOf(router)].split('Routes')[0]
    //                     r.route.url = RoutesPath[Routers.indexOf(router)]
    //                     routes.push(r.route)
    //                 }
    //             })
    //         } else if (router.router.stack) {
    //             router.router.stack.forEach(function (r) {
    //                 if (r.route && r.route.path) {
    //                     r.route.controller = RoutesList[Routers.indexOf(router)].split('Routes')[0]
    //                     r.route.url = RoutesPath[Routers.indexOf(router)]
    //                     routes.push(r.route)
    //                 }
    //             })
    //         }
    //     })
    //     try {
    //         const currentAclList = [];
    //         routes.forEach(route => {
    //             if (route.path !== undefined) {
    //                 const controller = route.controller
    //                 console.log('ACTION', route.stack[route.stack.length - 1].name)
    //                 let action = route.stack[route.stack.length - 1].name  //route.path.split('/')[1]
    //                 let description = Object.keys(route.methods).toString().toUpperCase() + ' ' + route.controller + ' ' + route.url + route.path;
    //                 let url = route.url + route.path
    //                 let method = Object.keys(route.methods).toString().toUpperCase()
    //                 currentAclList.push({ method, route: url, controller, action, description })
    //             }
    //         })
    //         const existingAclList = await AclActions.find({}, { method: 1, route: 1, controller: 1, action: 1, description: 1, _id: 0 })
    //         if (!existingAclList.length) {
    //             try {
    //                 await AclActions.create(currentAclList)
    //                 Util.sendCustomResult(req, res, 'SUCCESS', 'ACL_ACTIONS_UPDATED');
    //             } catch (error) {
    //                 console.error(error)
    //                 Util.sendCustomResult(req, res, 'SERVER_ERROR', 'ACL_ACTIONS_NOT_UPDATED');
    //             }
    //         } else {
    //             const exitingActions = existingAclList.map(acl => `${acl.method}@/@${acl.route}@/@${acl.controller}@/@${acl.description}@/@${acl.action ? acl.action : ''}`)
    //             const currentActions = currentAclList.map(acl => `${acl.method}@/@${acl.route}@/@${acl.controller}@/@${acl.description}@/@${acl.action ? acl.action : ''}`)

    //             var actionsToBeAdded = _.difference(currentActions, exitingActions);
    //             var actionsToBeDeleted = _.difference(exitingActions, currentActions);
    //             try {
    //                 actionsToBeDeleted.map(async deleteAction => {
    //                     const [method, route, controller, description, action] = deleteAction.split('@/@')
    //                     const deletedAction = await AclActions.deleteMany({ method, route, controller, description, action }) //.fetch()
    //                     // const data = await AclActions.update({controller},{$pull:{permissions:{$in:[deletedAction[0].id]}}})
    //                     return deletedAction
    //                 })
    //                 actionsToBeAdded.map(async addAction => {
    //                     const [method, route, controller, description, action] = addAction.split('@/@')
    //                     const data = await AclActions.create({ method, route, controller, action, description }) //.fetch() 
    //                     return data
    //                 })
    //                 Util.sendCustomResult(req, res, 'SUCCESS', 'ACL_ACTIONS_UPDATED');
    //             } catch (error) {
    //                 console.log(error)
    //                 Util.sendCustomResult(req, res, 'SERVER_ERROR', 'ACL_ACTIONS_NOT_UPDATED');
    //             }
    //         }
    //     } catch (error) {
    //         console.error(error)
    //         Util.sendCustomResult(req, res, 'SERVER_ERROR', 'ACL_ACTIONS_NOT_UPDATED');
    //     }

    // },
}