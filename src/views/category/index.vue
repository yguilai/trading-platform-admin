<template>
  <div class="app-container">
    <div class="app-filter">
      <el-button type="primary" icon="el-icon-plus" @click="handleAdd">添加</el-button>
    </div>
    <el-tree
      ref="categoryTree"
      v-loading="isCategoryTreeLoading"
      :data="categoryTree"
      :props="defaultTreeProps"
      default-expand-all
      :expand-on-click-node="false"
      node-key="id"
    >
      <span slot-scope="{ node, data }" class="custom-tree-node">
        <span>{{ node.label }}</span>
        <span>
          <el-button
            type="text"
            icon="el-icon-edit"
            size="mini"
            @click="() => editCategory(data)"
          />
          <el-button
            v-if="node.level !== 3"
            type="text"
            icon="el-icon-circle-plus-outline"
            size="mini"
            @click="() => appendCategory(data)"
          />
          <el-button
            type="text"
            icon="el-icon-remove-outline"
            size="mini"
            @click="() => removeCategory(node, data)"
          />
        </span>
      </span>
    </el-tree>

    <el-dialog
      v-loading="categoryDialog.isLoad"
      :title="categoryDialog.titleMap[categoryDialog.type]"
      :visible.sync="categoryDialog.visible"
      @closed="onDialogClosed"
    >
      <el-form
        ref="categoryForm"
        :model="categoryDialog.model"
        label-width="100px"
        style="width: 500px"
        :rules="rules"
      >
        <el-form-item label="ID" prop="id">
          <el-input v-model="categoryDialog.model.id" disabled />
        </el-form-item>

        <el-form-item label="分类名" prop="text">
          <el-input v-model="categoryDialog.model.text" />
        </el-form-item>

        <el-form-item label="排序" prop="order">
          <el-input v-model="categoryDialog.model.order" />
        </el-form-item>

        <el-form-item label="分类图标">
          <el-upload
            action="#"
            class="icon-uploader"
            :auto-upload="false"
            :on-change="onIcoUploadChange"
            :show-file-list="false"
            accept="image/*"
          >
            <img v-if="imageUrl !== ''" :src="imageUrl" class="ico" />
            <i v-else class="el-icon-plus" />
            <div slot="tip" class="el-upload__tip">
              只能上传图片文件，且不超过200kb
            </div>
          </el-upload>
        </el-form-item>
      </el-form>
      <div slot="footer">
        <el-button @click="categoryDialog.visible = false">取 消</el-button>

        <el-button
          v-if="categoryDialog.type !== 'add'"
          type="primary"
          @click="doEdit"
        >
          确 定
        </el-button>
        <el-button
          v-else
          type="primary"
          @click="doAdd"
        >
          添 加
        </el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import { mapGetters } from 'vuex'
import { getQiniuToken, uploadImg2Qiniu } from '@/api/file'
import { addCategory, deleteCategory, updateCategory } from '@/api/category'

export default {
  name: 'Category',
  data() {
    return {
      isCategoryTreeLoading: true,
      defaultTreeProps: {
        children: 'children',
        label: 'text'
      },
      categoryDialog: {
        isLoad: false,
        visible: false,
        titleMap: { view: '当前分类', edit: '编辑', add: '添加' },
        type: 'view',
        model: {}
      },
      defaultCategoryModel: {
        id: '',
        text: '',
        order: 0,
        ico: ''
      },
      rules: {
        id: [{ required: true, message: '请确认分类编号', trigger: 'blur' }],
        text: [{ required: true, message: '请输入分类名', trigger: 'blur' }],
        order: [{ required: true, message: '请输入分类排序号', trigger: 'blur' }]
      },
      icoFile: null,
      imageUrl: '',
      qiniuToken: ''
    }
  },
  computed: {
    ...mapGetters(['categoryTree'])
  },
  watch: {
    categoryTree(val) {
      this.isCategoryTreeLoading = val.length === 0
    }
  },
  created() {
    if (this.categoryTree.length === 0) {
      this.$store.dispatch('category/getCategoryTree')
    } else {
      this.isCategoryTreeLoading = false
    }
  },
  methods: {
    // 移除分类
    removeCategory(node, data) {
      const parent = node.parent
      console.log(data)
      const children = parent.data.children || parent.data
      if (data.children && data.children.length > 0) {
        this.$message({
          type: 'warning',
          message: '该分类还存在子分类, 请先处理子分类'
        })
        return
      }
      this.$confirm(
        '此操作将永久删除该分类, 且该分类下所有商品将无法通过分类查询到, 是否继续?',
        '提示',
        {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        }
      )
        .then(async() => {
          // TODO 对接删除分类接口
          await deleteCategory(data.id)
          const index = children.findIndex(d => d.id === data.id)
          children.splice(index, 1)
          this.$message.success('删除成功')
        })
        .catch(() => {
        })
    },
    // 编辑分类
    editCategory(data) {
      this.categoryDialog.model = { ...data }
      delete this.categoryDialog.model.children
      this.imageUrl = data.ico ? process.env.VUE_APP_QINIU_CDN + data.ico : ''
      this.openDialog('edit')
      // TODO 对接编辑分类接口
    },
    // 处理分类树中
    appendCategory(data) {
      const newChild = { ...this.defaultCategoryModel }
      const children = data.children
      if (!children) {
        newChild.id = data.id + '001'
        this.$set(data, 'children', [])
      } else if (children.length === 0) {
        newChild.id = data.id + '001'
      } else {
        const last = children[children.length - 1]
        const idPrefix = last.id.substring(0, last.id.length - 3)
        newChild.id =
            idPrefix +
            (parseInt(last.id.substring(last.id.length - 3)) + 1)
              .toString()
              .padStart(3, '0')
        newChild.order = last.order + 1
      }

      this.categoryDialog.model = newChild
      this.openDialog('add')
    },
    // 打开分类对话框
    openDialog(type) {
      this.categoryDialog.type = type
      this.categoryDialog.visible = true
    },
    // 关闭分类对话框后
    onDialogClosed() {
      this.icoFile = null
      this.imageUrl = ''
      this.categoryDialog.model = JSON.parse(
        JSON.stringify(this.defaultCategoryModel)
      )
      this.$refs.categoryForm.resetFields()
    },
    // 分类图标上传前
    beforeIconUpload(file) {
      const isLt200KB = file.size < 200
      if (!isLt200KB) {
        this.$message.error('上传头像图片大小不能超过 200KB!')
      }
      return isLt200KB
    },
    // 文件上传
    onIcoUploadChange(file, fileList) {
      this.icoFile = file
      this.imageUrl = URL.createObjectURL(file.raw)
    },
    // 执行编辑分类
    async doEdit() {
      this.categoryDialog.isLoad = true
      const hasIco = this.icoFile !== null
      let fileKey = this.categoryDialog.model.ico

      // 判断是否有修改图标
      if (hasIco) {
        if (this.qiniuToken === '') {
          try {
            const { data } = await getQiniuToken()
            this.qiniuToken = data
          } catch (err) {
            this.$message.error(err.message)
            return
          }
        }
        try {
          const formData = new FormData()
          formData.append('file', this.icoFile.raw)
          formData.append('token', this.qiniuToken)
          const { key } = await uploadImg2Qiniu(formData)
          fileKey = key
        } catch (err) {
          this.$message.error(err.message)
          return
        }
      }

      this.categoryDialog.model.ico = fileKey
      // 提交编辑
      try {
        await updateCategory(this.categoryDialog.model.id, this.categoryDialog.model)
        this.$message.success('编辑成功')
        this.$store.dispatch('category/getCategoryTree')
        this.categoryDialog.visible = false
      } catch (e) {
        this.$message.error(e.message)
      }
      this.categoryDialog.isLoad = false
    },
    // 执行添加分类
    async doAdd() {
      this.categoryDialog.isLoad = true
      const hasIco = this.icoFile !== null
      let fileKey = ''

      if (hasIco) {
        if (this.qiniuToken === '') {
          try {
            const { data } = await getQiniuToken()
            this.qiniuToken = data
          } catch (err) {
            this.$message.error(err.message)
            return
          }
        }
        try {
          const formData = new FormData()
          formData.append('file', this.icoFile.raw)
          formData.append('token', this.qiniuToken)
          const { key } = await uploadImg2Qiniu(formData)
          fileKey = key
        } catch (err) {
          this.$message.error(err.message)
          return
        }
      }

      this.categoryDialog.model.ico = fileKey
      try {
        await addCategory(this.categoryDialog.model)
        this.$message.success('添加成功')
        this.$store.dispatch('category/getCategoryTree')
        this.categoryDialog.visible = false
      } catch (e) {
        this.$message.error(e.message)
      }
      this.categoryDialog.isLoad = false
    },
    // 处理点击编辑按钮, 添加一级分类
    handleAdd() {
      const newChild = { ...this.defaultCategoryModel }
      const last = this.categoryTree[this.categoryTree.length - 1]
      newChild.id = (parseInt(last.id.substring(last.id.length - 3)) + 1).toString().padStart(3, '0')
      newChild.order = last.order + 1
      this.categoryDialog.model = newChild
      this.openDialog('add')
    }
  }
}
</script>

<style lang="scss" scope>
  .custom-tree-node {
    flex: 1;
    display: flex;
    align-items: center;
    justify-content: space-between;
    font-size: 14px;
    padding-right: 8px;
  }

  .el-tree {
    max-width: 50%;
  }

  $icoSize: 64px;

  .icon-uploader .el-upload {
    width: $icoSize;
    height: $icoSize;
    position: relative;
    overflow: hidden;
    border: 1px dashed #d9d9d9;
    border-radius: 6px;
    cursor: pointer;
    position: relative;
    overflow: hidden;

    &:hover {
      border-color: #409eff;
    }
  }

  .icon-uploader .ico {
    width: $icoSize;
    height: $icoSize;
  }

  .icon-uploader .el-upload .el-icon-plus {
    width: $icoSize;
    height: $icoSize;
    font-size: 20px;
    color: #8c939d;
    line-height: $icoSize;
    text-align: center;
  }

  .icon-uploader .el-upload-list--picture-card .el-upload-list__item {
    width: 64px;
    height: 64px;
  }
</style>
