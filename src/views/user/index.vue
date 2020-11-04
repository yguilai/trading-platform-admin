<template>
  <div class="app-container">
    <!-- 操作用户的一些按钮 -->
    <el-row type="flex" align="center">
      <el-button type="primary" @click="addUserDialogVisible = true">
        添加用户
      </el-button>
    </el-row>

    <!-- 用户列表 -->
    <el-table
      v-loading="listLoading"
      :data="page.list"
      element-loading-text="Loading"
      border
      fit
      highlight-current-row
    >
      <!-- 每列的表头 和 对应的内容的声明 -->
      <el-table-column align="center" label="ID" width="95" prop="userId" />
      <el-table-column label="头像" width="110" align="center">
        <template slot-scope="scope">
          <el-avatar
            shape="square"
            :size="50"
            :src="scope.row.avatar | composeImageUrl"
          />
        </template>
      </el-table-column>
      <el-table-column label="昵称" prop="nickname" align="center" />
      <el-table-column label="用户名" prop="username" align="center" />
      <el-table-column label="邮箱" prop="email" align="center" />
      <el-table-column label="年龄" prop="age" width="110" align="center" />
      <el-table-column label="性别" width="110" align="center">
        <template slot-scope="scope">
          {{ scope.row.gender === 1 ? '男' : '女' }}
        </template>
      </el-table-column>
      <el-table-column label="所在高校" align="center">
        <template slot-scope="scope">
          {{
            scope.row.location === undefined
              ? '无'
              : scope.row.location.university.name
          }}
        </template>
      </el-table-column>
      <el-table-column label="操作" width="150" align="center">
        <template slot-scope="scope">
          <el-button
            size="mini"
            type="primary"
            @click="handleEdit(scope.$index, scope.row)"
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
    <!-- 分页 -->
    <el-pagination
      layout="prev, pager, next"
      :page-size="page.pageSize"
      :page-count="page.pages"
      :current-page.sync="page.pageNum"
      @current-change="fetchData"
      @prev-click="fetchData"
      @next-click="fetchData"
    />

    <!-- 添加用户的弹出层 -->
    <el-dialog title="添加用户" :visible.sync="addUserDialogVisible">
      <el-form :model="addUserModel">
        <el-form-item label="用户名" label-width="80px">
          <el-input v-model="addUserModel.user.username" autocomplete="off" />
        </el-form-item>
        <el-form-item label="邮箱" label-width="80px">
          <el-input v-model="addUserModel.user.email" autocomplete="off" />
        </el-form-item>
        <el-form-item label="密码" label-width="80px">
          <el-input
            v-model="addUserModel.password"
            type="password"
            show-password
            autocomplete="off"
          />
        </el-form-item>
        <el-form-item label="昵称" label-width="80px">
          <el-input v-model="addUserModel.user.nickname" autocomplete="off" />
        </el-form-item>
        <el-form-item label="年龄" label-width="80px">
          <el-input v-model="addUserModel.user.age" autocomplete="off" />
        </el-form-item>
        <el-form-item label="性别" label-width="80px">
          <el-radio-group v-model="addUserModel.user.gender">
            <el-radio :label="1">男</el-radio>
            <el-radio :label="0">女</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="所在高校" label-width="80px">
          <el-cascader
            ref="addUserCascader"
            :value="addUserSelectedUniversity"
            placeholder="试试搜索：长沙学院"
            :options="universityTree"
            :props="cascaderProp"
            :show-all-levels="false"
            filterable
            clearable
          />
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="addUserDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="doAddUser">
          添 加
        </el-button>
      </div>
    </el-dialog>

    <!-- 编辑用户的弹出层 -->
    <el-dialog title="编辑用户" :visible.sync="editUserDialogVisible">
      <el-form :model="editUserModel">
        <el-form-item label="用户名" label-width="80px">
          <el-input
            v-model="editUserModel.username"
            autocomplete="off"
            disabled
          />
        </el-form-item>
        <el-form-item label="邮箱" label-width="80px">
          <el-input v-model="editUserModel.email" autocomplete="off" disabled />
        </el-form-item>
        <el-form-item label="昵称" label-width="80px">
          <el-input v-model="editUserModel.nickname" autocomplete="off" />
        </el-form-item>
        <el-form-item label="年龄" label-width="80px">
          <el-input v-model="editUserModel.age" autocomplete="off" />
        </el-form-item>
        <el-form-item label="性别" label-width="80px">
          <el-radio-group v-model="editUserModel.gender">
            <el-radio :label="1">男</el-radio>
            <el-radio :label="0">女</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="所在高校" label-width="80px">
          <el-cascader
            ref="editUserCascader"
            :value="defaultSelectedUniversity"
            placeholder="试试搜索：长沙学院"
            :options="universityTree"
            :props="cascaderProp"
            :show-all-levels="false"
            filterable
            clearable
          />
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="editUserDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="doEditUser">
          确 定
        </el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import { getUserList, editUser, addUser, deleteUser } from '@/api/user'
import { getUniversityTreeIndexList } from '@/api/university'
import { mapGetters } from 'vuex'

export default {
  filters: {
    statusFilter(status) {
      const statusMap = {
        published: 'success',
        draft: 'gray',
        deleted: 'danger'
      }
      return statusMap[status]
    }
  },
  data() {
    return {
      page: {
        pageSize: 20,
        pages: 0,
        list: [],
        pageNum: 1,
        total: 0
      },
      listLoading: true,
      editUserModel: {},
      defaultSelectedUniversity: [],
      editUserDialogVisible: false,
      // 级联选择器
      cascaderProp: {
        value: 'id',
        label: 'name'
        // expandTrigger: 'hover'
      },
      // 添加用户弹出层是否显示
      addUserDialogVisible: false,
      // 添加用户弹出层表单绑定model
      addUserModel: {
        user: {
          email: '',
          username: '',
          nickname: '',
          gender: 1,
          age: ''
        },
        password: ''
      },
      // 添加用户弹出层中, 高校选择器的选择项
      addUserSelectedUniversity: []
    }
  },
  computed: {
    ...mapGetters(['universityTree'])
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
    // 获取用户列表
    fetchData() {
      this.listLoading = true
      getUserList({ page: this.page.pageNum, size: this.page.pageSize }).then(
        response => {
          this.page = response.data
          this.listLoading = false
        }
      )
    },
    // 点击编辑用户
    async handleEdit(index, row) {
      this.editUserModel = row
      this.defaultSelectedUniversity = []
      if (row.location && row.location.university) {
        const { data } = await getUniversityTreeIndexList(
          row.location.university.id
        )
        this.defaultSelectedUniversity = data
      }

      this.editUserDialogVisible = true
    },
    // 点击删除用户
    handleDelete(index, row) {
      this.$confirm('此操作将永久删除该用户, 是否继续?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      })
        // eslint-disable-next-line space-before-function-paren
        .then(async () => {
          try {
            await deleteUser(row.userId)
            this.$message({
              type: 'success',
              message: '已删除该用户'
            })
            this.fetchData()
          } catch (error) {
            this.$message({
              type: 'error',
              message: '删除失败, ' + error.msg
            })
          }
        })
        .catch(() => {})
    },
    // 执行添加用户
    async doAddUser() {
      const nodes = this.$refs.addUserCascader.getCheckedNodes()
      if (nodes.length !== 0) {
        this.addUserModel.user.location = {
          university: {
            id: nodes[0].value,
            name: nodes[0].label
          }
        }
      }

      const { code, msg } = await addUser(this.addUserModel)

      if (code === 200) {
        this.$message({
          type: 'success',
          message: '添加成功'
        })
        this.addUserDialogVisible = false
        this.fetchData()
      } else {
        this.$message({
          type: 'error',
          message: '添加失败, ' + msg
        })
      }
    },
    doEditUser() {
      const nodes = this.$refs.editUserCascader.getCheckedNodes()
      if (
        this.editUserModel.location &&
        this.editUserModel.location.university &&
        nodes.length !== 0
      ) {
        this.editUserModel.location.university.id = nodes[0].value
        this.editUserModel.location.university.name = nodes[0].label
      } else if (nodes.length !== 0) {
        this.editUserModel.location = {
          university: {
            id: nodes[0].value,
            name: nodes[0].label
          }
        }
      }

      const loading = this.$loading({
        lock: true,
        text: '提交中...',
        spinner: 'el-icon-loading',
        background: 'rgba(0, 0, 0, 0.7)'
      })
      editUser(this.editUserModel)
        .then(response => {
          if (response.code === 200) {
            this.$nextTick(() => {
              loading.close()
            })

            this.editUserDialogVisible = false
          }
        })
        .catch(error => {
          this.$nextTick(() => {
            loading.close()
          })

          console.log(error)
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
