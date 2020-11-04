<template>
  <div class="app-container">
    <!-- 操作用户的一些按钮 -->
    <el-row type="flex" align="center">
      <el-button type="primary" @click="handleAddGoods">
        添加商品
      </el-button>
    </el-row>

    <!-- 商品列表 -->
    <el-table
      v-loading="listLoading"
      :data="page.list"
      element-loading-text="Loading"
      border
      fit
      highlight-current-row
      :default-sort="{ prop: 'id', order: 'descending' }"
    >
      <!-- 每列的表头 和 对应的内容的声明 -->
      <el-table-column
        align="center"
        label="ID"
        width="95"
        prop="id"
        fixed
        sortable
      />
      <el-table-column label="商品小图" width="110" align="center">
        <template slot-scope="scope">
          <el-avatar
            shape="square"
            :size="50"
            :src="scope.row.smallImage | composeImageUrl"
          />
        </template>
      </el-table-column>
      <el-table-column label="卖家" width="110" align="center">
        <template slot-scope="scope">
          {{ scope.row.seller.username }}
        </template>
      </el-table-column>
      <el-table-column
        label="商品内容"
        prop="content"
        min-width="240"
        align="left"
      />
      <el-table-column label="价格(￥)" prop="price" align="center" />
      <el-table-column label="分类" width="110" align="center">
        <template slot-scope="scope">
          {{ scope.row.category.text }}
        </template>
      </el-table-column>

      <el-table-column label="所属高校" align="center">
        <template slot-scope="scope">
          {{ scope.row.university.name }}
        </template>
      </el-table-column>
      <el-table-column
        label="状态"
        width="110"
        align="center"
        :filters="goodsStatus"
        :filter-method="filterTag"
        filter-placement="bottom-end"
      >
        <template slot-scope="{ row }">
          <el-tag
            :type="row.status | statusTypeFilter"
            size="small"
            effect="dark"
          >
            {{ row.status | statusFilter }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column
        label="发布时间"
        prop="createTime"
        width="155"
        align="center"
        sortable
      />
      <el-table-column label="操作" fixed="right" width="150" align="center">
        <template slot-scope="scope">
          <el-button
            size="mini"
            type="primary"
            @click="handleTableEdit(scope.$index, scope.row)"
          >
            编辑
          </el-button>
          <el-button
            size="mini"
            type="danger"
            @click="handleDelete(scope.$index, scope.row)"
          >
            删除
          </el-button>
        </template>
      </el-table-column>
    </el-table>
    <el-pagination
      layout="prev, pager, next"
      :page-size="page.pageSize"
      :page-count="page.pages"
      :current-page.sync="page.pageNum"
      @current-change="fetchData"
      @prev-click="fetchData"
      @next-click="fetchData"
    />

    <!-- 添加商品的弹出层 -->
    <el-dialog title="添加商品" :visible.sync="addGoodsDialogVisible" @closed="onAddDialogClosed">
      <el-form ref="addGoodsForm" :model="addGoodsModel" :rules="addGoodsRules">
        <el-form-item label="商品图片" label-width="80px">
          <el-upload
            ref="addGoodsUpload"
            action="#"
            list-type="picture-card"
            accept="image/*"
            :limit="8"
            :multiple="true"
            :auto-upload="false"
            :on-exceed="handleExceed"
            :on-change="handleUploadChange"
          >
            <i slot="default" class="el-icon-plus" />
          </el-upload>
        </el-form-item>
        <el-form-item label="商品内容" label-width="80px" prop="content">
          <el-input
            v-model="addGoodsModel.content"
            type="textarea"
            autocomplete="off"
          />
        </el-form-item>
        <el-form-item label="价格" label-width="80px" style="width: 280px" prop="price">
          <el-input v-model.number="addGoodsModel.price" autocomplete="off" />
        </el-form-item>
        <el-form-item label="卖家" label-width="80px" prop="sellerId">
          <el-select v-model.number="addGoodsModel.sellerId" placeholder="请选择卖家">
            <el-option
              v-for="item in userList"
              :key="item.username"
              :label="item.username"
              :value="item.userId"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="分类" label-width="80px" prop="categoryId">
          <el-cascader
            ref="addGoodsCategoryCascader"
            v-model="addGoodsModel.categoryId"
            placeholder="试试搜索：小米"
            :options="categoryTree"
            :props="categoryCascaderProp"
            :show-all-levels="false"
            filterable
            clearable
          />
        </el-form-item>
        <el-form-item label="状态" label-width="80px" prop="status">
          <el-select v-model.number="addGoodsModel.status" placeholder="请选择">
            <el-option
              v-for="item in goodsStatus"
              :key="item.value"
              :label="item.text"
              :value="item.value"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="所在高校" label-width="80px" prop="universityId">
          <el-cascader
            ref="addGoodsUniversityCascader"
            v-model="addGoodsModel.universityId"
            placeholder="试试搜索：长沙学院"
            :options="universityTree"
            :props="universityCascaderProp"
            :show-all-levels="false"
            filterable
            clearable
          />
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="addGoodsDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="doAdd">
          添 加
        </el-button>
      </div>
    </el-dialog>

    <!-- 编辑商品的弹出层 -->
    <el-dialog title="编辑商品" :visible.sync="editGoodsDialogVisible" @closed="onEditDialogClosed">
      <el-form :model="editGoodsModel">
        <el-form-item label="商品内容" label-width="80px">
          <el-input
            v-model="editGoodsModel.content"
            type="textarea"
            autocomplete="off"
          />
        </el-form-item>
        <el-form-item label="价格" label-width="80px" style="width: 280px">
          <el-input v-model="editGoodsModel.price" autocomplete="off" />
        </el-form-item>
        <el-form-item label="卖家" label-width="80px">
          <el-select
            v-model="editGoodsModel.seller.userId"
            placeholder="请选择卖家"
          >
            <el-option
              v-for="item in userList"
              :key="item.userId"
              :label="item.username"
              :value="item.userId"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="分类" label-width="80px" style="width: 280px">
          <el-cascader
            ref="editGoodsCategoryCascader"
            v-model="defaultSelectedCategory"
            placeholder="试试搜索：小米"
            :options="categoryTree"
            :props="categoryCascaderProp"
            :show-all-levels="false"
            filterable
            clearable
          />
        </el-form-item>
        <el-form-item label="状态" label-width="80px">
          <el-select v-model="editGoodsModel.status" placeholder="请选择">
            <el-option
              v-for="item in goodsStatus"
              :key="item.value"
              :label="item.text"
              :value="item.value"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="所在高校" label-width="80px">
          <el-cascader
            ref="editGoodsCascader"
            v-model="defaultSelectedUniversity"
            placeholder="试试搜索：长沙学院"
            :options="universityTree"
            :props="universityCascaderProp"
            :show-all-levels="false"
            filterable
            clearable
          />
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="editGoodsDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="doEdit">
          确 认
        </el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import { addGoods, deleteGoods, getGoodsList, updateGoods } from '@/api/goods'
import { getQiniuToken, uploadImg2Qiniu } from '@/api/file'
import { getUniversityTreeIndexList } from '@/api/university'
import GoodsConsts from '@/utils/goods-const'
import { mapGetters } from 'vuex'
import { getSelectedCategoryTreeIndex } from '@/api/category'

export default {
  filters: {
    // 商品状态类型过滤器
    statusTypeFilter(val) {
      switch (val) {
        case GoodsConsts.OFF:
          return 'info'
        case GoodsConsts.NORMAL:
          return ''
        case GoodsConsts.TRADING:
          return 'warning'
        case GoodsConsts.TRADING_OVER:
          return 'danger'
      }
    },
    // 商品状态对应文本过滤器
    statusFilter(val) {
      switch (val) {
        case GoodsConsts.OFF:
          return '已下架'
        case GoodsConsts.NORMAL:
          return '上架中'
        case GoodsConsts.TRADING:
          return '交易中'
        case GoodsConsts.TRADING_OVER:
          return '已售出'
      }
    }
  },
  data() {
    return {
      // 商品当前页数据
      page: {
        pageSize: 20,
        pages: 0,
        list: [],
        pageNum: 1,
        total: 0
      },
      // 商品列表是否加载
      listLoading: true,
      // 商品状态
      goodsStatus: [
        { text: '已下架', value: 0 },
        { text: '上架中', value: 1 },
        { text: '交易中', value: 2 },
        { text: '已售出', value: 3 }
      ],
      // 七牛token
      token: '',
      // 添加商品弹出层
      addGoodsDialogVisible: false,
      // 添加商品表单模型
      addGoodsModel: {
        sellerId: null,
        categoryId: [],
        universityId: [],
        content: '',
        price: 0,
        status: 0
      },
      defaultAddGoodsModel: {
        sellerId: null,
        categoryId: [],
        universityId: [],
        content: '',
        price: 0,
        status: 0
      },
      addGoodsFileList: [],
      addGoodsRules: {
        sellerId: { required: true, message: '请选择卖家', trigger: 'blur' },
        categoryId: { required: true, message: '请选择分类', trigger: 'blur' },
        universityId: { required: true, message: '请选择高校', trigger: 'blur' },
        content: { required: true, message: '请输入商品内容', trigger: 'blur' },
        price: { type: 'number', required: true, message: '请输入价格', trigger: 'blur' },
        status: { type: 'number', required: true, message: '请选择状态', trigger: 'blur' }
      },
      //
      editGoodsDialogVisible: false,
      editGoodsModel: {
        seller: { userId: '' },
        category: { id: '', text: '' },
        university: { id: '', name: '' },
        content: '',
        price: '',
        status: 0
      },
      defaultEditGoodsModel: {
        seller: { userId: '' },
        category: { id: '', text: '' },
        university: { id: '', name: '' },
        content: '',
        price: '',
        status: 0
      },
      defaultSelectedCategory: [],
      defaultSelectedUniversity: [],
      // 级联选择器
      universityCascaderProp: {
        value: 'id',
        label: 'name'
      },
      categoryCascaderProp: {
        value: 'id',
        label: 'text'
      }
    }
  },
  computed: {
    ...mapGetters(['universityTree', 'userList']),
    categoryTree() {
      const tree = [...this.$store.getters['categoryTree']]

      if (tree.length === 0) {
        this.$store.dispatch('category/getCategoryTree')
      }

      for (let i = 0, len = tree.length; i < len; i++) {
        const c2 = tree[i].children
        if (c2 && c2.length !== 0) {
          for (let j = 0, len2 = c2.length; j < len2; j++) {
            const c3 = c2[j].children
            for (let k = 0, len3 = c3.length; k < len3; k++) {
              delete c3[k].children
            }
          }
        }
      }
      return tree
    }
  },
  created() {
    this.fetchData()
  },
  mounted() {
    if (this.universityTree.length === 0) {
      this.$store.dispatch('university/getUniversityTree')
    }
  },
  methods: {
    // 表格过滤
    filterTag(value, row) {
      return row.status === value
    },
    // 加载数据
    fetchData() {
      this.listLoading = true
      getGoodsList({ page: this.page.pageNum, size: this.page.pageSize }).then(
        response => {
          this.page = response.data
          this.listLoading = false
        }
      )
    },
    // 点击表格的编辑
    async handleTableEdit(index, row) {
      this.editGoodsModel = { ...row }

      getUniversityTreeIndexList(row.university.id).then(res => {
        this.defaultSelectedUniversity = res.data
      })

      getSelectedCategoryTreeIndex(row.category.id).then(res => {
        this.defaultSelectedCategory = res.data
      })

      if (this.userList.length === 0) {
        this.$store.dispatch('customer/getUserList')
      }

      this.editGoodsDialogVisible = true
    },
    // 图片上传数量超过限制
    handleExceed(files, fileList) {
      this.$message({
        type: 'warning',
        message: '添加上传队列失败, 最多上传8张图片'
      })
    },
    handleUploadChange(file, fileList) {
      this.addGoodsFileList = fileList
    },
    handleAddGoods() {
      if (this.categoryTree.length === 0) {
        this.$store.dispatch('category/getCategoryTree')
      }

      if (this.userList.length === 0) {
        this.$store.dispatch('customer/getUserList')
      }
      this.addGoodsDialogVisible = true
    },
    onAddDialogClosed() {
      this.addGoodsModel = { ...this.defaultAddGoodsModel }
      this.addGoodsFileList = []
      this.$refs.addGoodsUpload.clearFiles()
      this.$refs.addGoodsForm.resetFields()
    },
    onEditDialogClosed() {
      this.editGoodsModel = { ...this.defaultEditGoodsModel }
    },
    // 执行添加商品
    async doAdd() {
      const fileKeys = []
      if (this.addGoodsFileList.length === 0) {
        this.$message.error('至少上传一张图片')
        return
      }

      // 校验表单
      this.$refs.addGoodsForm.validate(async valid => {
        if (valid) {
          // 判断是否有token
          if (this.token === '') {
            try {
              const { data } = await getQiniuToken()
              this.token = data
            } catch (e) {
              this.$message.error(e.message)
            }
          }

          // 上传图片
          try {
            for (const file of this.addGoodsFileList.values()) {
              const form = new FormData()
              form.append('file', file.raw)
              form.append('token', this.token)
              const { key } = await uploadImg2Qiniu(form)
              fileKeys.push(key)
            }
            this.$message.success('图片上传成功')
          } catch (e) {
            this.$message.error(e.message)
          }

          // 添加商品
          if (fileKeys.length !== 0) {
            try {
              const model = this.addGoodsModel
              model.categoryId = model.categoryId[model.categoryId.length - 1]
              model.universityId = model.universityId[model.universityId.length - 1]
              model.smallImage = fileKeys[0]
              model.imageList = fileKeys.join(',')
              await addGoods(model)
              this.$message.success('添加成功')
              this.addGoodsDialogVisible = false
              this.fetchData()
            } catch (e) {
              this.$message.error(e.message)
            }
          }
        } else {
          return false
        }
      })
    },
    // 编辑商品
    async doEdit() {
      try {
        const model = { ...this.editGoodsModel }
        model.universityId = this.defaultSelectedUniversity[this.defaultSelectedUniversity.length - 1]
        model.categoryId = this.defaultSelectedCategory[this.defaultSelectedCategory.length - 1]
        model.sellerId = model.seller.userId
        delete model.createTime
        delete model.seller
        delete model.university
        delete model.category
        await updateGoods(model.id, model)
        this.$message.success('编辑成功')
        this.editGoodsDialogVisible = false
        this.fetchData()
      } catch (e) {
        this.$message.error(e.message)
      }
    },
    // 删除商品
    handleDelete(index, row) {
      if (row.status === GoodsConsts.TRADING || row.status === GoodsConsts.TRADING_OVER) {
        this.$message.warning('因商品状态无法被删除')
        return
      }

      this.$confirm('确认删除该用户?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      })
        .then(async() => {
          try {
            await deleteGoods(row.id)
            this.$message.success('删除成功')
          } catch (e) {
            this.$message.error(e.message)
          }
        })
        .catch(() => {
        })
    }
  }
}
</script>

<style lang="scss" scope>
  .el-row {
    margin-bottom: 10px;
  }

  .el-pagination {
    display: flex;
    justify-content: center;
  }
</style>
