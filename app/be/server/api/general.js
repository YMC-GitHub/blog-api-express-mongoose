/**
 * commom R-get list
 * @method list
 * @param  {[type]} req     [description]
 * @param  {[type]} res     [description]
 * @param  {[type]} mongoDB [description]
 * @param  {[type]} sort    排序
 * @return {[type]}         [description]
 */
exports.list = (req, res, mongoDB, sort = '-_id') => {
    sort = sort || '-_id'
    let { limit, page } = req.query
    page = parseInt(page, 10)
    limit = parseInt(limit, 10)
    if (!page) page = 1
    if (!limit) limit = 10
    const skip = (page - 1) * limit
    Promise.all([
        mongoDB
            .find()
            .sort(sort)
            .skip(skip)
            .limit(limit)
            .exec(),
        mongoDB.countAsync()
    ])
        .then(result => {
            const total = result[1]
            const totalPage = Math.ceil(total / limit)
            const json = {
                code: 200,
                data: {
                    list: result[0],
                    total,
                    hasNext: totalPage > page ? 1 : 0,
                    hasPrev: page > 1 ? 1 : 0
                }
            }
            res.json(json)
        })
        .catch(err => {
            res.json({
                code: -200,
                message: err.toString()
            })
        })
}

/**
 * commom R-get an item
 * @method item
 * @param  {[type]} req     [description]
 * @param  {[type]} res     [description]
 * @param  {[type]} mongoDB [description]
 * @return {[type]}         [description]
 */
exports.item = (req, res, mongoDB) => {
    const _id = req.query.id
    if (!_id) {
        res.json({
            code: -200,
            message: 'args error'
        })
    }
    mongoDB
        .findOneAsync({ _id })
        .then(result => {
            res.json({
                code: 200,
                data: result
            })
        })
        .catch(err => {
            res.json({
                code: -200,
                message: err.toString()
            })
        })
}

/**
 * commom D-delete an item
 * @method flagDelete
 * @param  {[type]}   req     [description]
 * @param  {[type]}   res     [description]
 * @param  {[type]}   mongoDB [description]
 * @return {[type]}           [description]
 */
exports.deletes = (req, res, mongoDB) => {
    const _id = req.query.id
    mongoDB
        .updateAsync({ _id }, { is_delete: 1 })
        .then(() => {
            res.json({
                code: 200,
                message: 'delete success',
                data: 'success'
            })
        })
        .catch(err => {
            res.json({
                code: -200,
                message: err.toString()
            })
        })
}

/**
 * commom U-update an item
 * @method modify
 * @param  {[type]} res     [description]
 * @param  {[type]} mongoDB [description]
 * @param  {[type]} _id     [description]
 * @param  {[type]} data    [description]
 * @return {[type]}         [description]
 */
exports.modify = (res, mongoDB, _id, data) => {
    mongoDB
        .findOneAndUpdateAsync({ _id }, data, { new: true })
        .then(result => {
            res.json({
                code: 200,
                message: 'update success',
                data: result
            })
        })
        .catch(err => {
            res.json({
                code: -200,
                message: err.toString()
            })
        })
}

/**
 * commom U-recover an item
 * @method recover
 * @param  {[type]} req     [description]
 * @param  {[type]} res     [description]
 * @param  {[type]} mongoDB [description]
 * @return {[type]}         [description]
 */
exports.recover = (req, res, mongoDB) => {
    const _id = req.query.id
    mongoDB
        .updateAsync({ _id }, { is_delete: 0 })
        .then(() => {
            res.json({
                code: 200,
                message: 'recover success',
                data: 'success'
            })
        })
        .catch(err => {
            res.json({
                code: -200,
                message: err.toString()
            })
        })
}
