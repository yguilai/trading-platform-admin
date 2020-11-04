<template>
  <div class="app-container">
    <div class="app-filter">
      <el-input
        ref="searchByCodeInput"
        v-model="search.code"
        placeholder="输入单号查询"
        clearable
        style="width: 300px"
      />
      <el-button type="primary" icon="el-icon-search" @click="searchByCode">
        查询
      </el-button>
      <!--<el-button type="primary" icon="el-icon-plus">新建</el-button>-->
    </div>

    <el-table
      v-loading="isTableLoad"
      :data="page.list"
      border
      style="width: 100%"
    >
      <el-table-column type="expand">
        <template slot-scope="{ row }">
          <el-form label-position="left" inline class="demo-table-expand">
            <el-form-item label="订单编号">
              <span>{{ row.code }}</span>
            </el-form-item>
            <el-form-item label="商品 ID">
              <span>{{ row.goods.id }}</span>
            </el-form-item>
            <el-form-item label="商品小图">
              <el-avatar
                shape="square"
                :size="50"
                :src="row.goods.smallImage | composeImageUrl"
              />
            </el-form-item>
            <el-form-item label="商品内容">
              <span>{{ row.goods.content }}</span>
            </el-form-item>
            <el-form-item label="卖家 ID">
              <span>{{ row.seller.userId }}</span>
            </el-form-item>
            <el-form-item label="卖家昵称">
              <span>{{ row.seller.nickname }}</span>
            </el-form-item>
            <el-form-item label="买家 ID">
              <span>{{ row.buyer.userId }}</span>
            </el-form-item>
            <el-form-item label="买家昵称">
              <span>{{ row.seller.nickname }}</span>
            </el-form-item>
            <!--<el-form-item label="店铺地址">-->
            <!--  <span>{{ props.row.address }}</span>-->
            <!--</el-form-item>-->
            <!--<el-form-item label="商品描述">-->
            <!--  <span>{{ props.row.desc }}</span>-->
            <!--</el-form-item>-->
          </el-form>
        </template>
      </el-table-column>
      <el-table-column
        header-align="center"
        align="center"
        prop="code"
        label="单号"
        min-width="300"
      />
      <el-table-column
        header-align="center"
        align="center"
        label="商品Id"
        width="100"
      >
        <template slot-scope="{ row }">
          <span>{{ row.goods.id }}</span>
        </template>
      </el-table-column>
      <el-table-column
        header-align="center"
        align="center"
        label="卖家"
        width="100"
      >
        <template slot-scope="{ row }">
          <span>{{ row.seller.nickname }}</span>
        </template>
      </el-table-column>
      <el-table-column
        header-align="center"
        align="center"
        label="买家"
        width="100"
      >
        <template slot-scope="{ row }">
          <span>{{ row.buyer.nickname }}</span>
        </template>
      </el-table-column>
      <el-table-column
        header-align="center"
        align="center"
        prop="status"
        label="订单状态"
        width="150"
      >
        <template slot-scope="{ row }">
          <el-tag :type="row.status | statusFilter" effect="dark">{{
            row.status | statusContentFilter
          }}</el-tag>
        </template>
      </el-table-column>
      <el-table-column
        header-align="center"
        align="center"
        prop="createTime"
        label="创建时间"
        width="170"
      />
      <el-table-column
        header-align="center"
        align="center"
        prop="updateTime"
        label="更新时间"
        width="170"
      />
      <el-table-column
        header-align="center"
        align="center"
        label="操作"
        fixed="right"
        width="200"
      >
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

    <el-dialog :title="dialog.titleMap[dialog.type]" :visible.sync="dialog.visible" width="width">
      <el-form v-if="dialog.type === 'view'" :model="dialog.model" label-width="80px" style="width: 500px">
        <el-form-item label="单号">
          <el-input v-model="dialog.model.code" disabled />
        </el-form-item>
        <el-form-item label="商品">
          <el-form-item>
            <el-avatar shape="square" :size="50" :src="dialog.model.goods.smallImage | composeImageUrl" />
          </el-form-item>
          <el-form-item>
            <el-input v-model="dialog.model.goods.content" type="textarea" disabled />
          </el-form-item>
        </el-form-item>
        <el-form-item label="卖家">
          <el-input v-model="dialog.model.seller.nickname" disabled />
        </el-form-item>
        <el-form-item label="买家">
          <el-input v-model="dialog.model.buyer.nickname" disabled />
        </el-form-item>
        <el-form-item label="下单时间">
          <el-input v-model="dialog.model.createTime" disabled />
        </el-form-item>
        <el-form-item label="更新时间">
          <el-input v-model="dialog.model.updateTime" disabled />
        </el-form-item>
        <el-form-item label="状态">
          <el-select v-model="dialog.model.status">
            <el-option
              v-for="(item, index) in statusArr"
              :key="index"
              :label="item.label"
              :value="item.value"
            />
          </el-select>
        </el-form-item>
      </el-form>
      <el-form ref="orderForm" :model="dialog.model" label-width="80px" style="width: 500px">
        <el-form-item label="单号">
          <el-input v-model="dialog.model.code" disabled />
        </el-form-item>
        <el-form-item label="状态">
          <el-select v-model="dialog.model.status">
            <el-option
              v-for="(item, index) in statusArr"
              :key="index"
              :label="item.label"
              :value="item.value"
            />
          </el-select>
        </el-form-item>
      </el-form>
      <div v-if="dialog.type !== 'view'" slot="footer">
        <el-button @click="dialog.visible = false">取 消</el-button>
        <el-button type="primary" @click="doEdit">
          确 定
        </el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import { deleteOrder, getOneOrderByCode, getOrderPage, updateOrderStatus } from '@/api/order'
import orderConst from '@/utils/order-const'

export default {
  name: 'Order',
  filters: {
    statusFilter(val) {
      switch (val) {
        case orderConst.OFF:
          return 'info'
        case orderConst.BUYER_PLACE_ORDER:
          return ''
        case orderConst.SELLER_RECEIPT:
          return 'success'
        case orderConst.TRADING:
          return 'warning'
        case orderConst.TRADING_OVER:
          return 'danger'
      }
    },
    statusContentFilter(val) {
      switch (val) {
        case orderConst.OFF:
          return '已取消'
        case orderConst.BUYER_PLACE_ORDER:
          return '已下单'
        case orderConst.SELLER_RECEIPT:
          return '已接单'
        case orderConst.TRADING:
          return '交易中'
        case orderConst.TRADING_OVER:
          return '已完成'
      }
    }
  },
  data() {
    return {
      search: {
        code: ''
      },
      isTableLoad: true,
      // 商品当前页数据
      page: {
        pageSize: 20,
        pages: 0,
        list: [],
        pageNum: 1,
        total: 0
      },
      dialog: {
        visible: false,
        titleMap: { view: '当前订单', edit: '编辑', add: '添加' },
        type: '',
        model: {}
      },
      statusArr: [
        { value: 0, label: '已取消' },
        { value: 1, label: '已下单' },
        { value: 2, label: '已接单' },
        { value: 3, label: '交易中' },
        { value: 4, label: '已完成' }
      ]
    }
  },
  created() {
    this.fetchData()
  },
  methods: {
    // 获取数据
    async fetchData() {
      this.isTableLoad = true
      try {
        const { data } = await getOrderPage({
          page: this.page.pageNum,
          size: this.page.pageSize
        })
        this.page = data
      } catch (err) {
        this.$message.error(err.message)
      }
      this.isTableLoad = false
    },
    // 处理表格点击编辑按钮
    handleTableEdit(index, row) {
      this.dialog.model = { ...row }
      this.openDialog('edit')
    },
    // 处理表格点击删除按钮
    handleDelete(index, row) {
      this.$confirm('确认删除该订单?', '提示', {
        type: 'warning',
        showCancelButton: '取消',
        showConfirmButton: '确认'
      })
        .then(async() => {
          try {
            await deleteOrder(row.id)
            this.$message.success('删除成功')
            this.fetchData()
          } catch (e) {
            this.$message.error(e.message)
          }
        })
        .catch(() => {})
    },
    // 执行编辑
    async doEdit() {
      try {
        await updateOrderStatus(this.dialog.model.id, this.dialog.model.status)
        this.$message.success('修改成功')
        this.dialog.visible = false
        this.fetchData()
      } catch (e) {
        this.$message.error(e.message)
      }
    },
    // 执行删除
    doAdd() {},
    // 根据单号查询
    async searchByCode() {
      if (this.search.code.trim() === '') {
        this.$message.info('请输入单号')
        this.$refs.searchByCodeInput.focus()
        return
      }

      try {
        const { data } = await getOneOrderByCode(this.search.code.trim())
        this.dialog.model = data
        console.log(data)
        this.openDialog('view')
      } catch (e) {
        this.$message.error(e.message)
      }
    },
    openDialog(type) {
      this.dialog.type = type
      this.dialog.visible = true
    }
  }
}
</script>

<style lang="scss" scoped>
  .demo-table-expand {
    font-size: 0;
  }
  .demo-table-expand label {
    width: 90px;
    color: #99a9bf;
  }
  .demo-table-expand .el-form-item {
    margin-right: 0;
    margin-bottom: 0;
    width: 100%;
  }
</style>
